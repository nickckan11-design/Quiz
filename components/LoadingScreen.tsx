
import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, BrainCircuit, FileText, CheckCircle, PenTool } from 'lucide-react';

export const LoadingScreen = () => {
  const [step, setStep] = useState(0);
  
  // Simulated steps based on typical processing time (~10-15s)
  const steps = [
    { icon: <FileText size={20} />, text: "Reading & analyzing content...", duration: 2500 },
    { icon: <BrainCircuit size={20} />, text: "Identifying key concepts...", duration: 3000 },
    { icon: <PenTool size={20} />, text: "Drafting questions...", duration: 4000 },
    { icon: <Sparkles size={20} />, text: "Finalizing explanations...", duration: 2000 }
  ];

  useEffect(() => {
    let currentStep = 0;
    
    const runSteps = () => {
      if (currentStep >= steps.length - 1) return;
      
      const timeout = setTimeout(() => {
        currentStep++;
        setStep(currentStep);
        runSteps();
      }, steps[currentStep].duration);
      
      return () => clearTimeout(timeout);
    };

    const cleanup = runSteps();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-6 w-full max-w-2xl mx-auto">
      <div className="relative mb-10">
        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-pulse" />
        </div>
      </div>
      
      <div className="w-full space-y-3">
        {steps.map((s, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-700 border ${
              idx === step 
                ? 'bg-white shadow-lg border-indigo-100 scale-105 opacity-100 translate-x-0' 
                : idx < step 
                  ? 'bg-slate-50 border-transparent opacity-60 scale-100' 
                  : 'bg-transparent border-transparent opacity-20 translate-y-2'
            }`}
          >
            <div className={`p-2 rounded-full transition-colors ${
              idx === step ? 'bg-indigo-100 text-indigo-600' : 
              idx < step ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {idx < step ? <CheckCircle size={20} /> : s.icon}
            </div>
            
            <div className="flex-1">
              <span className={`font-semibold text-lg transition-colors ${
                idx === step ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {s.text}
              </span>
              {idx === step && (
                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-600 animate-loading-bar" style={{width: '100%'}}></div>
                </div>
              )}
            </div>

            {idx === step && <Loader2 size={20} className="text-indigo-600 animate-spin" />}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-20%); }
          100% { transform: translateX(0%); }
        }
        .animate-loading-bar {
          animation: loading-bar 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
