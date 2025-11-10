
import React from 'react';
import { TargetIcon, ClipboardListIcon, SparklesIcon } from './icons/CardIcons';

interface MarketingPageProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-4 mb-3">
            <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-900 p-2 rounded-full">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
            {children}
        </p>
    </div>
);


const MarketingPage: React.FC<MarketingPageProps> = ({ onStart }) => {
  return (
    <div className="space-y-12">
      <section className="text-center bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Chart Your Course to Mastery.
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Stop guessing your way through learning. SkillMorph uses AI to build a personalized, step-by-step roadmap to get you from where you are to where you want to be.
        </p>
        <div className="mt-8">
          <button 
            onClick={onStart} 
            className="px-8 py-4 text-lg font-bold text-white bg-teal-600 rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-offset-slate-800 transition-transform hover:scale-105"
          >
            Create Your Free Learning Plan
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<SparklesIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />} 
            title="AI-Powered Personalization"
          >
              Your roadmap is generated just for you, based on your target role, time commitment, and preferred learning style.
          </FeatureCard>
          <FeatureCard 
            icon={<ClipboardListIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />} 
            title="Adaptive Skill Assessment"
          >
              A quick, AI-generated quiz pinpoints your starting line, so you learn what you need without wasting time.
          </FeatureCard>
           <FeatureCard 
            icon={<TargetIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />} 
            title="Clear, Actionable Steps"
          >
             Get a week-by-week plan with curated resources and milestone projects to keep you motivated and on track.
          </FeatureCard>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">How It Works in 3 Simple Steps</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 text-xl font-bold text-teal-600 dark:text-teal-400 mx-auto">1</div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">Define Your Goal</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell us what role you're aiming for.</p>
            </div>
             <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 text-xl font-bold text-teal-600 dark:text-teal-400 mx-auto">2</div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">Assess Your Skills</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Take a quick, AI-powered quiz.</p>
            </div>
             <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 text-xl font-bold text-teal-600 dark:text-teal-400 mx-auto">3</div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">Generate Your Plan</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Receive your personalized roadmap and start learning!</p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
