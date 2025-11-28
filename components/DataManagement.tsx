
import React, { useRef, useState } from 'react';
import { Download, Upload, Database, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { exportBackup, importBackup } from '../services/storageService';
import { QuizSession } from '../types';

interface DataManagementProps {
  onDataUpdate: (newData: QuizSession[]) => void;
  onClose: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onDataUpdate, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    try {
      await exportBackup();
    } catch (e) {
      console.error(e);
      alert("Failed to create backup.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('importing');
    try {
      const updatedData = await importBackup(file);
      onDataUpdate(updatedData);
      setStatus('success');
      setMsg(`Successfully restored ${updatedData.length} quizzes.`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMsg("Invalid file format or corrupted data.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Data Management</h2>
            <p className="text-sm text-slate-500">Secure your quiz history</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-1">Permanent Backup</h3>
            <p className="text-xs text-slate-500 mb-4">
              Download your entire history as a file. You can save this file to your computer or cloud to ensure you never lose your data, even if you clear your browser or update the app.
            </p>
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download size={18} />
              Download Backup (.json)
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-1">Restore Data</h3>
            <p className="text-xs text-slate-500 mb-4">
              Import a previously saved backup file. This will merge with your current history.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button 
              onClick={handleImportClick}
              disabled={status === 'importing'}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              {status === 'importing' ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
              Import Backup
            </button>
            
            {status === 'success' && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 p-2 rounded">
                <Check size={14} /> {msg}
              </div>
            )}
            {status === 'error' && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle size={14} /> {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
