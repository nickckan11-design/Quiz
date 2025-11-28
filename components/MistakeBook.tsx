import React, { useMemo } from 'react';
import { QuizSession, QuizData, QuestionType } from '../types';
import { AlertTriangle, BookOpen, ArrowLeft, Check, X, Flag } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

interface MistakeBookProps {
  history: QuizSession[];
  onBack: () => void;
}

export const MistakeBook: React.FC<MistakeBookProps> = ({ history, onBack }) => {
  // Aggregate all questions
  const aggregatedItems = useMemo(() => {
    const items: Array<{
      sessionId: string;
      quizTitle: string;
      questionId: number;
      questionText: string;
      userAnswer: string;
      correctAnswer: string;
      explanation: string;
      isCorrect: boolean;
      isUnsure: boolean;
      timestamp: number;
      type: QuestionType;
      options?: string[];
    }> = [];

    history.forEach(session => {
      // Only include sessions that have at least some answers
      session.quizData.questions.forEach(q => {
        const userAnswer = session.userAnswers[q.id] || "";
        const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        const isUnsure = session.unsureQuestionIds.includes(q.id);

        // Filter: We want items that are Incorrect OR Marked Unsure
        if (!isCorrect || isUnsure) {
          items.push({
            sessionId: session.id,
            quizTitle: session.quizData.title,
            questionId: q.id,
            questionText: q.questionText,
            userAnswer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            isCorrect,
            isUnsure,
            timestamp: session.timestamp,
            type: q.type,
            options: q.options
          });
        }
      });
    });

    // Sort by most recent
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  // Construct a virtual "QuizData" object for the export function
  const mistakeQuizData: QuizData = useMemo(() => ({
    title: "Mistake Book Review",
    description: "A collection of questions you answered incorrectly or marked as unsure.",
    questions: aggregatedItems.map((item, idx) => ({
      id: idx, // re-index for the export view
      type: item.type,
      questionText: item.questionText,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation
    }))
  }), [aggregatedItems]);

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="mb-6 flex items-center justify-between no-print">
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        {aggregatedItems.length > 0 && (
          <ExportMenu quizData={mistakeQuizData} />
        )}
      </div>

      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-bold">Mistake Book Review</h1>
        <p>Review of difficult questions.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex items-center gap-4 no-print">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mistake Book</h1>
          <p className="text-slate-600">Reviewing {aggregatedItems.length} questions you answered incorrectly or marked as unsure.</p>
        </div>
      </div>

      {aggregatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
           <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
             <Check size={32} />
           </div>
           <h2 className="text-xl font-bold text-slate-800">Clean Sheet!</h2>
           <p className="text-slate-500 mt-2">You don't have any mistakes or unsure questions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {aggregatedItems.map((item, index) => (
            <div 
              key={`${item.sessionId}-${item.questionId}`}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 relative overflow-hidden break-inside-avoid"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  From: {item.quizTitle}
                </span>
                <div className="flex gap-2 no-print">
                  {!item.isCorrect && (
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                      <X size={12} /> Incorrect
                    </span>
                  )}
                  {item.isUnsure && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1">
                      <Flag size={12} fill="currentColor" /> Unsure
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-medium text-slate-900 text-lg mb-4">
                <span className="print-only inline mr-2">{index + 1}.</span>
                {item.questionText}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border text-sm ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-xs opacity-70 block mb-1 font-bold">Your Answer:</span>
                  {item.userAnswer || <span className="italic opacity-50">Empty</span>}
                </div>
                <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-sm">
                  <span className="text-xs opacity-70 block mb-1 font-bold">Correct Answer:</span>
                  {item.correctAnswer}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-2 text-indigo-600">
                  <BookOpen size={16} className="mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
