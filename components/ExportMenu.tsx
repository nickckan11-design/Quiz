import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer, ChevronDown } from 'lucide-react';
import { exportToWord, triggerPrint } from '../services/exportService';
import { QuizData } from '../types';

interface ExportMenuProps {
  quizData: QuizData;
  className?: string;
  simple?: boolean; // If true, shows just an icon instead of full button text
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ quizData, className = '', simple = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportWord = (withAnswers: boolean) => {
    exportToWord(quizData, withAnswers);
    setIsOpen(false);
  };

  const handlePrint = () => {
    triggerPrint();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className} no-print`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-colors ${
          simple 
            ? 'p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg' 
            : 'text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100'
        }`}
        title="Export options"
      >
        <Download size={simple ? 18 : 16} />
        {!simple && (
          <>
            <span>Export</span>
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden">
          <div className="p-1">
            <button
              onClick={() => handlePrint()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors text-left"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button
              onClick={() => handleExportWord(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors text-left"
            >
              <FileText size={16} />
              Word (Blank Quiz)
            </button>
            <button
              onClick={() => handleExportWord(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors text-left"
            >
              <FileText size={16} />
              Word (With Answers)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
