import React, { useState } from 'react';
import { QuizData, UserAnswers } from '../types';
import { Check, X, ArrowLeft, BookOpen, Flag, LayoutGrid, AlertTriangle } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

interface QuizResultsProps {
  quizData: QuizData;
  userAnswers: UserAnswers;
  unsureIds: number[];
  onBackToDashboard: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ 
  quizData, 
  userAnswers, 
  unsureIds,
  onBackToDashboard 
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'unsure'>('all');

  let score = 0;
  
  const results = quizData.questions.map(q => {
    const userAnswer = userAnswers[q.id] || "";
    // Simple case-insensitive trim match
    const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const isUnsure = unsureIds.includes(q.id);
    if (isCorrect) score++;
    return { ...q, isCorrect, userAnswer, isUnsure };
  });

  const percentage = Math.round((score / quizData.questions.length) * 100);

  const getScoreColor = (p: number) => {
    if (p >= 80) return 'text-green-600';
    if (p >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredResults = results.filter(item => {
    if (filter === 'incorrect') return !item.isCorrect;
    if (filter === 'unsure') return item.isUnsure;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      
      <div className="mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBackToDashboard}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <ExportMenu quizData={quizData} />
      </div>

      {/* Print Header */}
      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-bold">{quizData.title} - Results</h1>
        <p>Score: {score} / {quizData.questions.length} ({percentage}%)</p>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-slate-200 no-print">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{quizData.title}</h2>
            <p className="text-slate-500">Result Summary</p>
          </div>
          
          <div className="flex gap-8 text-center">
            <div>
              <div className={`text-5xl font-bold mb-1 ${getScoreColor(percentage)}`}>
                {score}<span className="text-2xl text-slate-400">/{quizData.questions.length}</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</div>
            </div>
            {unsureIds.length > 0 && (
              <div>
                <div className="text-5xl font-bold text-amber-500 mb-1">
                  {unsureIds.length}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                   <Flag size={12} fill="currentColor" /> Unsure
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-6 px-2 no-print">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${
            filter === 'all' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutGrid size={16} /> All Questions
          {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setFilter('incorrect')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${
            filter === 'incorrect' ? 'text-red-600' : 'text-slate-500 hover:text-red-600'
          }`}
        >
          <X size={16} /> Incorrect Only
          {filter === 'incorrect' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setFilter('unsure')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${
            filter === 'unsure' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'
          }`}
        >
          <Flag size={16} fill={filter === 'unsure' ? "currentColor" : "none"} /> Marked Unsure
          {filter === 'unsure' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-t-full" />}
        </button>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
            <p>No questions found for this filter.</p>
          </div>
        ) : (
          filteredResults.map((item, index) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 relative overflow-hidden break-inside-avoid ${
                item.isCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              {item.isUnsure && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1 no-print">
                  <Flag size={10} fill="currentColor" /> Marked Unsure
                </div>
              )}

              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 no-print">
                   {item.isCorrect ? (
                     <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                       <Check size={18} strokeWidth={3} />
                     </div>
                   ) : (
                     <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                       <X size={18} strokeWidth={3} />
                     </div>
                   )}
                </div>
                
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-medium text-slate-900 text-lg">
                       <span className="print-only inline mr-2">{index + 1}.</span>
                       {item.questionText}
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* User Answer */}
                    <div className={`p-4 rounded-lg border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-70">
                        Your Answer
                      </span>
                      <p className={`font-medium ${item.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {item.userAnswer || <span className="italic text-slate-400">No answer provided</span>}
                      </p>
                    </div>

                    {/* Correct Answer (always show for review) */}
                    <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Correct Answer
                      </span>
                      <p className="font-medium text-slate-800">{item.correctAnswer}</p>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-start gap-2 text-indigo-600 mb-2">
                      <BookOpen size={18} className="mt-0.5" />
                      <span className="font-semibold text-sm">Explanation</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed bg-indigo-50/50 p-3 rounded-md">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
