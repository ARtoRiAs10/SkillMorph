
import React, { useState, useMemo } from 'react';
import { UserInput, Roadmap } from './types';
import { generateLearningPath } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import LearningRoadmap from './components/LearningRoadmap';
import LoadingSpinner from './components/LoadingSpinner';
import MarketingPage from './components/MarketingPage';
import { LogoIcon } from './components/icons/LogoIcon';

type View = 'marketing' | 'app';

const App: React.FC = () => {
  const [view, setView] = useState<View>('marketing');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedWeeks, setCompletedWeeks] = useState<boolean[]>([]);

  const handleFormSubmit = async (input: UserInput) => {
    setIsLoading(true);
    setError(null);
    setRoadmap(null);
    setUserInput(input);
    try {
      const generatedRoadmap = await generateLearningPath(input);
      setRoadmap(generatedRoadmap);
      setCompletedWeeks(Array(generatedRoadmap.weeklyPlans.length).fill(false));
    } catch (err) {
      console.error(err);
      setError('Failed to generate learning path. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setUserInput(null);
    setRoadmap(null);
    setError(null);
    setIsLoading(false);
    setCompletedWeeks([]);
  };

  const handleGoHome = () => {
    handleReset();
    setView('marketing');
  };

  const handleStartApp = () => {
    handleReset();
    setView('app');
  };

  const handleWeekCompletionToggle = (index: number) => {
    setCompletedWeeks(prev => {
      const newCompleted = [...prev];
      newCompleted[index] = !newCompleted[index];
      return newCompleted;
    });
  };

  const progressPercentage = useMemo(() => {
    if (completedWeeks.length === 0) return 0;
    const completedCount = completedWeeks.filter(Boolean).length;
    return Math.round((completedCount / completedWeeks.length) * 100);
  }, [completedWeeks]);
  
  const renderAppContent = () => {
    return (
      <>
        {!roadmap && !isLoading && !error && (
            <UserInputForm onSubmit={handleFormSubmit} />
          )}
          
          {isLoading && <LoadingSpinner />}

          {error && (
            <div className="text-center p-8 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg">
              <p className="text-red-700 dark:text-red-300 font-semibold">An Error Occurred</p>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900"
              >
                Try Again
              </button>
            </div>
          )}

          {roadmap && !isLoading && (
            <LearningRoadmap 
              roadmap={roadmap} 
              userInput={userInput!}
              completedWeeks={completedWeeks}
              onWeekToggle={handleWeekCompletionToggle}
              progress={progressPercentage}
            />
          )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 print:hidden">
          <button onClick={handleGoHome} className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1 -m-1">
            <LogoIcon className="h-10 w-10 text-teal-500 group-hover:text-teal-600 transition-colors" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors">SkillMorph</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your AI-Powered Learning Co-Pilot</p>
            </div>
          </button>
          {view === 'app' && roadmap && (
             <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-offset-slate-900 transition-colors"
            >
              New Plan
            </button>
          )}
        </header>

        <main>
          {view === 'marketing' ? (
            <MarketingPage onStart={handleStartApp} />
          ) : (
            renderAppContent()
          )}
        </main>

        <footer className="text-center mt-12 text-xs text-slate-400 dark:text-slate-500 print:hidden">
          <p>Powered by Google Gemini. Generated plans are suggestions and should be adapted to your needs.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
