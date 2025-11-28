
import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { QuizForm } from './components/QuizForm';
import { QuizResults } from './components/QuizResults';
import { MistakeBook } from './components/MistakeBook';
import { LoadingScreen } from './components/LoadingScreen';
import { generateQuizFromText } from './services/geminiService';
import { saveSessionToDB, getAllSessionsFromDB, deleteSessionFromDB } from './services/storageService';
import { QuizData, UserAnswers, AppState, QuizSession } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.DASHBOARD);
  const [history, setHistory] = useState<QuizSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const sessions = await getAllSessionsFromDB();
        setHistory(sessions);
      } catch (e) {
        console.error("Failed to load history", e);
        setError("Failed to load your history. Please refresh.");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadData();
  }, []);

  const createSession = async (data: QuizData) => {
    const newSession: QuizSession = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      quizData: data,
      userAnswers: {},
      unsureQuestionIds: [],
      isCompleted: false,
      score: 0
    };
    
    // Save to DB
    await saveSessionToDB(newSession);
    
    // Update local state
    setHistory(prev => [newSession, ...prev]);
    return newSession.id;
  };

  const handleGenerateQuiz = async (text: string, shuffle: boolean, imageBase64?: string) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      // Pass image if available
      const data = await generateQuizFromText(text, imageBase64);
      
      if (shuffle) {
        data.questions = data.questions
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
      }

      const newId = await createSession(data);
      setActiveSessionId(newId);
      setAppState(AppState.QUIZ);
    } catch (err) {
      console.error(err);
      setError("We encountered an issue processing your content. Please try again or check your internet connection.");
      setAppState(AppState.DASHBOARD);
    }
  };

  const handleResumeSession = (sessionId: string) => {
    const session = history.find(h => h.id === sessionId);
    if (!session) return;
    
    setActiveSessionId(sessionId);
    if (session.isCompleted) {
      setAppState(AppState.RESULTS);
    } else {
      setAppState(AppState.QUIZ);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSessionFromDB(sessionId);
    setHistory(prev => prev.filter(h => h.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setAppState(AppState.DASHBOARD);
    }
  };

  const updateActiveSession = async (answers: UserAnswers, unsureIds: number[], isCompleted: boolean = false) => {
    if (!activeSessionId) return;

    // We need to construct the updated session
    const currentSession = history.find(h => h.id === activeSessionId);
    if (!currentSession) return;

    let score = currentSession.score;
    // Calculate score if completing
    if (isCompleted) {
        let correctCount = 0;
        currentSession.quizData.questions.forEach(q => {
          const ans = answers[q.id] || "";
          if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            correctCount++;
          }
        });
        score = Math.round((correctCount / currentSession.quizData.questions.length) * 100);
    }

    const updatedSession: QuizSession = {
      ...currentSession,
      userAnswers: answers,
      unsureQuestionIds: unsureIds,
      isCompleted: isCompleted ? true : currentSession.isCompleted,
      score
    };

    // Save to DB
    await saveSessionToDB(updatedSession);

    // Update state
    setHistory(prev => prev.map(session => 
      session.id === activeSessionId ? updatedSession : session
    ));
  };

  const activeSession = history.find(h => h.id === activeSessionId);

  if (loadingHistory) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => {
              setAppState(AppState.DASHBOARD);
              setActiveSessionId(null);
            }}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              Q
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">QuizMaster</span>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
             {appState === AppState.DASHBOARD && "Dashboard"}
             {appState === AppState.QUIZ && "Taking Quiz"}
             {appState === AppState.RESULTS && "Results Analysis"}
             {appState === AppState.MISTAKE_BOOK && "Mistake Book"}
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-10 flex flex-col">
        {error && (
          <div className="w-full max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative shadow-sm flex items-center gap-2 animate-in slide-in-from-top-2" role="alert">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {appState === AppState.DASHBOARD && (
          <InputSection 
            onGenerate={handleGenerateQuiz} 
            history={history}
            onResume={handleResumeSession}
            onDelete={handleDeleteSession}
            onOpenMistakeBook={() => setAppState(AppState.MISTAKE_BOOK)}
            onDataUpdate={setHistory}
          />
        )}

        {appState === AppState.MISTAKE_BOOK && (
          <MistakeBook 
            history={history}
            onBack={() => setAppState(AppState.DASHBOARD)}
          />
        )}

        {appState === AppState.LOADING && (
          <LoadingScreen />
        )}

        {appState === AppState.QUIZ && activeSession && (
          <QuizForm 
            quizData={activeSession.quizData} 
            initialAnswers={activeSession.userAnswers}
            initialUnsure={activeSession.unsureQuestionIds}
            onSubmit={(answers, unsureIds) => {
              updateActiveSession(answers, unsureIds, true);
              setAppState(AppState.RESULTS);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveProgress={(answers, unsureIds) => {
              updateActiveSession(answers, unsureIds, false);
            }}
            onExit={() => {
              setAppState(AppState.DASHBOARD);
              setActiveSessionId(null);
            }}
          />
        )}

        {appState === AppState.RESULTS && activeSession && (
          <QuizResults 
            quizData={activeSession.quizData} 
            userAnswers={activeSession.userAnswers}
            unsureIds={activeSession.unsureQuestionIds}
            onBackToDashboard={() => {
              setAppState(AppState.DASHBOARD);
              setActiveSessionId(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
