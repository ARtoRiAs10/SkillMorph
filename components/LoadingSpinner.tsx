
import React from 'react';

const LoadingSpinner: React.FC = () => {
    const messages = [
        "Analyzing your skill gap...",
        "Curating top learning resources...",
        "Designing your milestone projects...",
        "Building your personalized roadmap...",
        "Almost there, charting your course...",
    ];

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-center items-center mb-4">
                <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Generating Your Plan</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2 transition-opacity duration-500">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
