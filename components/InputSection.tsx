
import React, { useState, useRef } from 'react';
import { Sparkles, FileText, ArrowRight, Shuffle, History, Trash2, Play, CheckCircle, BookOpen, Image as ImageIcon, X, Upload, Settings } from 'lucide-react';
import { QuizSession } from '../types';
import { ExportMenu } from './ExportMenu';
import { DataManagement } from './DataManagement';

interface InputSectionProps {
  onGenerate: (text: string, shuffle: boolean, imageBase64?: string) => void;
  history: QuizSession[];
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onOpenMistakeBook: () => void;
  onDataUpdate: (data: QuizSession[]) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  onGenerate, 
  history, 
  onResume, 
  onDelete,
  onOpenMistakeBook,
  onDataUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [inputText, setInputText] = useState('');
  const [shuffle, setShuffle] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (!inputText.trim() && !selectedImage) {
      alert("Please provide text content or upload an image.");
      return;
    }
    // If only image is provided, add dummy text to context
    const textToSend = inputText.trim() || "Please analyze this image.";
    onGenerate(textToSend, shuffle, selectedImage || undefined);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle Paste (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // Prevent pasting binary string
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          return; // Stop after finding first image
        }
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const completedCount = history.filter(h => h.isCompleted).length;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 relative animate-in fade-in duration-500">
      
      {/* Settings Modal */}
      {showSettings && (
        <DataManagement 
          onClose={() => setShowSettings(false)}
          onDataUpdate={onDataUpdate}
        />
      )}

      {/* Header with Stats & Settings */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
        >
          <Settings size={16} /> Data & Backup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <History size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Quizzes</p>
            <p className="text-2xl font-bold text-slate-800">{history.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Completed</p>
            <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
          </div>
        </div>
        <button 
          onClick={onOpenMistakeBook}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow text-left group"
        >
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-200 transition-colors">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Mistake Book</p>
            <p className="text-lg font-bold text-slate-800 flex items-center gap-1">
              Review Errors <ArrowRight size={16} />
            </p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'create' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={18} />
            Create New Quiz
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'history' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History size={18} />
            My History
          </button>
        </div>

        {/* Create Tab Content */}
        {activeTab === 'create' && (
          <div 
            className="relative p-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag & Drop Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-indigo-50/90 backdrop-blur-sm border-2 border-dashed border-indigo-500 z-50 flex items-center justify-center rounded-b-xl">
                <div className="text-center animate-bounce">
                  <Upload className="w-16 h-16 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-indigo-900">Drop image here</h3>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Generate a Quiz</h2>
              <p className="text-slate-500">
                Paste text, upload an image, or <strong>Paste (Ctrl+V)</strong> a screenshot directly.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <textarea
                  className="w-full h-48 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
                  placeholder="Paste your content here...&#10;&#10;Or paste an image (Ctrl+V) directly into this box.&#10;&#10;Examples:&#10;1. Raw list of questions from a PDF&#10;2. A paragraph about Photosynthesis&#10;3. Vocabulary list"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPaste={handlePaste}
                />
              </div>

              {/* Image Upload Area */}
              <div className="flex flex-col gap-3">
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  
                  {!selectedImage ? (
                    <div className="flex gap-2">
                       <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-3 py-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-indigo-50/50 hover:border-indigo-400 hover:text-indigo-600 transition-all group"
                      >
                        <div className="p-2 bg-slate-100 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                          <ImageIcon size={20} />
                        </div>
                        <span className="font-medium">Upload Image or Drag & Drop</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center gap-4 animate-in fade-in">
                      <div className="h-16 w-16 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm relative group">
                         <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-indigo-900 truncate flex items-center gap-2">
                           <ImageIcon size={14} /> Image Attached
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">Ready to extract questions from this image.</p>
                      </div>
                      <button 
                        onClick={clearImage}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove image"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Shuffle size={16} />
                <span className="font-medium">Shuffle Questions</span>
              </label>

              <button
                onClick={handleGenerate}
                disabled={!inputText.trim() && !selectedImage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30 transform active:scale-95 duration-150"
              >
                <Sparkles size={18} />
                Generate Quiz
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="p-0 animate-in fade-in slide-in-from-right-2 duration-300">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <History size={32} className="opacity-50" />
                </div>
                <p>No quiz history found.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                  Create your first quiz
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{session.quizData.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                        <span>{formatDate(session.timestamp)}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{session.quizData.questions.length} Questions</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {session.isCompleted ? (
                          <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            Score: {session.score}%
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                            In Progress ({Object.keys(session.userAnswers).length}/{session.quizData.questions.length})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <ExportMenu quizData={session.quizData} simple={true} />
                      <button
                        onClick={() => onResume(session.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          session.isCompleted 
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200'
                        }`}
                      >
                        {session.isCompleted ? (
                          <>
                            <FileText size={16} /> Review
                          </>
                        ) : (
                          <>
                            <Play size={16} /> Resume
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('Are you sure you want to permanently delete this quiz?')) {
                            onDelete(session.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
