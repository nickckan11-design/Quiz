import React, { useState } from 'react';
import { QuizData, QuestionType, UserAnswers } from '../types';
import { AlertCircle, Flag, ArrowLeft } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

interface QuizFormProps {
  quizData: QuizData;
  initialAnswers: UserAnswers;
  initialUnsure: number[];
  onSubmit: (answers: UserAnswers, unsureIds: number[]) => void;
  onSaveProgress: (answers: UserAnswers, unsureIds: number[]) => void;
  onExit: () => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({ 
  quizData, 
  initialAnswers, 
  initialUnsure,
  onSubmit, 
  onSaveProgress,
  onExit 
}) => {
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);
  const [unsureIds, setUnsureIds] = useState<number[]>(initialUnsure);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);

  // Auto-save helper
  const updateState = (newAnswers: UserAnswers, newUnsure: number[]) => {
    setAnswers(newAnswers);
    setUnsureIds(newUnsure);
    onSaveProgress(newAnswers, newUnsure);
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    const newAnswers = { ...answers, [questionId]: option };
    updateState(newAnswers, unsureIds);
    if (showUnansweredWarning) setShowUnansweredWarning(false);
  };

  const handleInputChange = (questionId: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    updateState(newAnswers, unsureIds);
    if (showUnansweredWarning) setShowUnansweredWarning(false);
  };

  const toggleUnsure = (questionId: number) => {
    const isCurrentlyUnsure = unsureIds.includes(questionId);
    const newUnsure = isCurrentlyUnsure
      ? unsureIds.filter(id => id !== questionId)
      : [...unsureIds, questionId];
    updateState(answers, newUnsure);
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = quizData.questions.length;

    if (answeredCount < totalCount) {
      if (!window.confirm(`You have only answered ${answeredCount} out of ${totalCount} questions. Submit anyway?`)) {
        setShowUnansweredWarning(true);
        return;
      }
    }
    onSubmit(answers, unsureIds);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-10 no-print">
        <div className="flex items-start justify-between w-full md:w-auto md:flex-col">
          <button 
            onClick={onExit}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Save & Exit
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{quizData.title}</h1>
        </div>
        <div className="flex items-center gap-4">
           <ExportMenu quizData={quizData} />
           <div className="flex items-center gap-4 text-sm font-medium text-slate-500 border-l border-slate-200 pl-4">
             <div className="flex flex-col items-end">
               <span>{Object.keys(answers).length} / {quizData.questions.length} Answered</span>
               <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                 <div 
                   className="h-full bg-indigo-600 transition-all duration-300"
                   style={{ width: `${(Object.keys(answers).length / quizData.questions.length) * 100}%` }}
                 />
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Print-only Title */}
      <div className="hidden print-only mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">{quizData.title}</h1>
        <p className="text-center text-gray-500 mb-6">{quizData.description}</p>
        <div className="border-b-2 border-black mb-8"></div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quizData.questions.map((q, index) => {
          const isUnsure = unsureIds.includes(q.id);
          const isAnswered = !!answers[q.id];

          return (
            <div 
              key={q.id} 
              className={`bg-white rounded-lg shadow-sm border transition-all duration-200 p-6 break-inside-avoid ${
                isUnsure ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 no-print">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                    showUnansweredWarning && !isAnswered
                      ? 'bg-red-100 text-red-600 ring-2 ring-red-200' 
                      : isUnsure 
                        ? 'bg-amber-100 text-amber-700'
                        : isAnswered
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Print Numbering */}
                <div className="hidden print-only font-bold text-lg mr-2">
                  {index + 1}.
                </div>

                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-slate-800 mb-4 leading-relaxed whitespace-pre-wrap flex-1 mr-4">
                      {q.questionText}
                    </h3>
                    
                    <button
                      onClick={() => toggleUnsure(q.id)}
                      className={`no-print flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        isUnsure 
                          ? 'bg-amber-100 text-amber-700 border-amber-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Flag size={14} fill={isUnsure ? "currentColor" : "none"} />
                      {isUnsure ? "Marked Unsure" : "Mark Unsure"}
                    </button>
                  </div>

                  {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                    <div className="space-y-3">
                      {q.options.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                            answers[q.id] === option
                              ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 shadow-sm'
                              : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => handleOptionSelect(q.id, option)}
                            className="hidden no-print"
                          />
                          {/* Print Radio */}
                          <div className="hidden print-only w-4 h-4 border border-black mr-2 rounded-full flex-shrink-0"></div>

                          <div className={`no-print w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${
                             answers[q.id] === option ? 'border-indigo-600' : 'border-slate-400'
                          }`}>
                            {answers[q.id] === option && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                          </div>
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === QuestionType.FILL_IN_BLANK && (
                    <div className="mt-2">
                       <input
                        type="text"
                        className="no-print w-full border-b-2 border-slate-300 bg-slate-50 px-3 py-3 text-slate-800 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 rounded-t-md"
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                      />
                      <div className="hidden print-only border-b border-black h-8 w-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 no-print">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm font-medium text-slate-600 flex items-center gap-3">
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${Object.keys(answers).length === quizData.questions.length ? 'bg-green-500' : 'bg-amber-500'}`} />
               <span>{Object.keys(answers).length} Answered</span>
             </div>
             {unsureIds.length > 0 && (
               <div className="flex items-center gap-2 text-amber-600">
                 <Flag size={12} fill="currentColor" />
                 <span>{unsureIds.length} Unsure</span>
               </div>
             )}
             {showUnansweredWarning && (
               <span className="text-red-600 text-xs flex items-center gap-1 animate-pulse ml-2">
                 <AlertCircle size={12} /> Complete all questions
               </span>
             )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none w-full sm:w-48 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
