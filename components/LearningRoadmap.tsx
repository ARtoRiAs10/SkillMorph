
import React, { useState, useEffect, useRef } from 'react';
import type { Roadmap, UserInput, WeeklyPlan, Resource } from '../types';
import { BookIcon, CodeIcon, LinkIcon, VideoIcon, CheckCircleIcon, ChevronDownIcon, DownloadIcon } from './icons/CardIcons';
import ProgressBar from './ProgressBar';

interface LearningRoadmapProps {
  roadmap: Roadmap;
  userInput: UserInput;
  completedWeeks: boolean[];
  onWeekToggle: (index: number) => void;
  progress: number;
}

const ResourceItem: React.FC<{ resource: Resource }> = ({ resource }) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'video': return <VideoIcon className="h-5 w-5 text-red-500" />;
      case 'article':
      case 'docs': return <BookIcon className="h-5 w-5 text-sky-500" />;
      case 'course': return <BookIcon className="h-5 w-5 text-purple-500" />;
      case 'interactive':
      case 'project_idea': return <CodeIcon className="h-5 w-5 text-amber-500" />;
      default: return <LinkIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
      {getIcon()}
      <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">{resource.title}</span>
    </a>
  );
};

type WeekStatus = 'completed' | 'current' | 'upcoming';

const WeeklyPlanItem: React.FC<{ 
  plan: WeeklyPlan; 
  status: WeekStatus; 
  onToggle: () => void; 
  isOpen: boolean; 
  onHeaderClick: () => void 
}> = ({ plan, status, onToggle, isOpen, onHeaderClick }) => {
  const isCompleted = status === 'completed';

  const containerClasses = {
    completed: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100',
    current: 'bg-white dark:bg-slate-800 border-transparent ring-2 ring-teal-500 shadow-lg',
    upcoming: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${containerClasses[status]} break-inside-avoid print:shadow-none print:border-slate-300`}>
      <header onClick={onHeaderClick} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
        <div className="flex items-center space-x-4">
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex-shrink-0 print:hidden" aria-label={`Mark week ${plan.week} as ${isCompleted ? 'incomplete' : 'complete'}`}>
            <CheckCircleIcon className={`h-7 w-7 transition-colors ${isCompleted ? 'text-teal-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`} />
          </button>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Week {plan.week}</p>
            <h3 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{plan.topic}</h3>
          </div>
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} print:hidden`} />
      </header>
      <div className={`p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 ${isOpen ? 'block' : 'hidden'} print:block`}>
        <div>
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Objectives</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Resources</h4>
          <div className="space-y-1">
            {plan.resources.map((res, i) => <ResourceItem key={i} resource={res} />)}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Project</h4>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-slate-200">{plan.project.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{plan.project.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ roadmap, userInput, completedWeeks, onWeekToggle, progress }) => {
  const currentWeekIndex = completedWeeks.findIndex(c => !c);
  const [openWeek, setOpenWeek] = useState<number | null>(currentWeekIndex !== -1 ? currentWeekIndex : 0);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newCurrentWeekIndex = completedWeeks.findIndex(c => !c);
    if (newCurrentWeekIndex !== -1) {
      setOpenWeek(newCurrentWeekIndex);
    } else {
      // If all weeks are completed, maybe keep the last one open or collapse all
      setOpenWeek(completedWeeks.length > 0 ? completedWeeks.length -1 : null);
    }
  }, [completedWeeks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWeekClick = (index: number) => {
    setOpenWeek(openWeek === index ? null : index);
  };

  const getWeekStatus = (index: number): WeekStatus => {
    if (completedWeeks[index]) {
      return 'completed';
    }
    const firstIncomplete = completedWeeks.findIndex(c => !c);
    if (index === firstIncomplete) {
      return 'current';
    }
    return 'upcoming';
  };
  
  const handleExportJSON = () => {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(roadmap, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `${roadmap.title.toLowerCase().replace(/\s/g, '_')}_roadmap.json`;
      link.click();
      setIsExportMenuOpen(false);
  };

  const handlePrint = () => {
      window.print();
      setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 print:shadow-none print:border-b">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{roadmap.title}</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{roadmap.summary}</p>
            </div>
            <div ref={exportMenuRef} className="relative print:hidden">
                <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800">
                    <DownloadIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                    <span className="sr-only">Export options</span>
                </button>
                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                            <button onClick={handleExportJSON} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Download as JSON</button>
                            <button onClick={handlePrint} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Print as PDF</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <div className="mt-4 print:hidden">
            <ProgressBar progress={progress} />
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.weeklyPlans.map((plan, index) => (
          <WeeklyPlanItem
            key={plan.week}
            plan={plan}
            status={getWeekStatus(index)}
            onToggle={() => onWeekToggle(index)}
            isOpen={openWeek === index}
            onHeaderClick={() => handleWeekClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default LearningRoadmap;
