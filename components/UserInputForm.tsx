import React, { useState } from 'react';
import type { UserInput, LearningStyle, Quiz, SkillAssessmentResult } from '../types';
import { generateSkillAssessment, evaluateTestAndSummarizeSkills } from '../services/geminiService';
import { CheckCircleIcon } from './icons/CardIcons';

// Simple spinner for internal loading states
const MiniSpinner: React.FC = () => (
    <svg className="animate-spin h-6 w-6 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UserInputForm: React.FC<{ onSubmit: (data: UserInput) => void; }> = ({ onSubmit }) => {
    type Step = 'goal' | 'loadingQuiz' | 'quiz' | 'evaluating' | 'configure' | 'error';

    const [step, setStep] = useState<Step>('goal');
    const [error, setError] = useState<string | null>(null);

    const [targetRole, setTargetRole] = useState('Frontend Developer');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [assessment, setAssessment] = useState<SkillAssessmentResult | null>(null);
    const [timePerWeek, setTimePerWeek] = useState(10);
    const [learningStyle, setLearningStyle] = useState<LearningStyle>('mixed');

    const handleGoalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole.trim()) {
            setError("Please enter your target role.");
            return;
        }
        setError(null);
        setStep('loadingQuiz');
        try {
            const generatedQuiz = await generateSkillAssessment(targetRole);
            setQuiz(generatedQuiz);
            setAnswers(Array(generatedQuiz.questions.length).fill(null));
            setStep('quiz');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate your skill assessment. Please try again.");
            setStep('error');
        }
    };

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = optionIndex;
            return newAnswers;
        });
    };

    const handleQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (answers.some(a => a === null)) {
            setError("Please answer all questions before submitting.");
            return;
        }
        setError(null);
        setStep('evaluating');
        try {
            const result = await evaluateTestAndSummarizeSkills(targetRole, quiz!.questions, answers);
            setAssessment(result);
            setStep('configure');
        } catch (err) {
            setError(err instanceof Error ? err.message : "There was an error evaluating your results. Please try again.");
            setStep('error');
        }
    };
    
    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            currentSkills: assessment!.summary,
            targetRole,
            timePerWeek,
            learningStyle
        });
    };
    
    const handleTryAgain = () => {
        setError(null);
        setTargetRole('Frontend Developer');
        setStep('goal');
    };

    const learningStyles: { id: LearningStyle; label: string }[] = [
        { id: 'video', label: 'Video Tutorials' },
        { id: 'articles', label: 'Articles & Docs' },
        { id: 'practice', label: 'Hands-on Practice' },
        { id: 'mixed', label: 'A Mix of Everything' },
    ];
    
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            {step === 'goal' && (
                <form onSubmit={handleGoalSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Let's Get Started</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">What's your learning goal? This will help us create a quick quiz to assess your current skill level.</p>
                    <div>
                        <label htmlFor="targetRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Role or Goal</label>
                        <input
                            id="targetRole"
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Data Scientist, Full-Stack Developer"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <div className="pt-2">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-offset-slate-800 transition-transform hover:scale-[1.02]">
                            Start Assessment
                        </button>
                    </div>
                </form>
            )}

            {(step === 'loadingQuiz' || step === 'evaluating') && (
                <div className="text-center p-10">
                    <div className="flex justify-center items-center mb-4"><MiniSpinner/></div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        {step === 'loadingQuiz' ? 'Generating Your Assessment...' : 'Evaluating Your Skills...'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {step === 'loadingQuiz' ? 'This will just take a moment.' : 'Analyzing your answers to find your strengths.'}
                    </p>
                </div>
            )}
            
            {step === 'quiz' && quiz && (
                <form onSubmit={handleQuizSubmit} className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{quiz.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400">Answer these questions to help us personalize your roadmap.</p>
                    </div>
                    <div className="space-y-6">
                        {quiz.questions.map((q, qIndex) => (
                            <div key={qIndex}>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{qIndex + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((option, oIndex) => (
                                        <button type="button" key={oIndex} onClick={() => handleAnswerSelect(qIndex, oIndex)} className={`w-full text-left p-3 rounded-md border transition-all flex items-center space-x-3 ${answers[qIndex] === oIndex ? 'bg-teal-50 dark:bg-teal-900/50 border-teal-500 ring-2 ring-teal-500' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${answers[qIndex] === oIndex ? 'border-teal-500 bg-teal-500' : 'border-slate-400'}`}>
                                               {answers[qIndex] === oIndex && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className="flex-1">{option}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center py-2">{error}</p>}
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-offset-slate-800 transition-transform hover:scale-[1.02]">
                        Submit Answers
                    </button>
                </form>
            )}

            {step === 'configure' && assessment && (
                 <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assessment Complete!</h2>
                        <p className="text-slate-500 dark:text-slate-400">You scored <span className="font-bold text-teal-600 dark:text-teal-400">{assessment.score}/{assessment.total}</span>. Here's a summary of your current skills:</p>
                        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-slate-700 dark:text-slate-300 italic">{assessment.summary}</p>
                        </div>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700"/>
                    <p className="text-slate-500 dark:text-slate-400">Now, let's finalize your plan.</p>
                    
                    <div>
                        <label htmlFor="timePerWeek" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How many hours per week can you study?</label>
                        <div className="flex items-center space-x-4">
                            <input id="timePerWeek" type="range" min="1" max="40" value={timePerWeek} onChange={(e) => setTimePerWeek(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-500"/>
                            <span className="font-semibold text-teal-600 dark:text-teal-400 w-20 text-center">{timePerWeek} hrs/week</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">What's your preferred learning style?</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {learningStyles.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => setLearningStyle(id)} className={`px-4 py-2 text-sm rounded-md transition-colors border ${learningStyle === id ? 'bg-teal-500 border-teal-500 text-white font-semibold' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                                {label}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-offset-slate-800 transition-transform hover:scale-[1.02]">
                            Generate My Plan
                        </button>
                    </div>
                </form>
            )}
            
            {step === 'error' && (
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">Something Went Wrong</h3>
                    <p className="text-red-600 dark:text-red-500 mt-2 mb-4">{error}</p>
                    <button onClick={handleTryAgain} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserInputForm;
