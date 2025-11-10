import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{cappedProgress}% Complete</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div 
          className="bg-teal-500 h-2.5 rounded-full transition-all duration-700 ease-in-out" 
          style={{ width: `${cappedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;