import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

import { Github } from 'lucide-react';

function App() {
    const [analysisResults, setAnalysisResults] = useState(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                                WA
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                WhatsApp Sentiment Analyzer
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {analysisResults && (
                                <button
                                    onClick={() => setAnalysisResults(null)}
                                    className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                                >
                                    Analyze Another Chat
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="py-12">
                <AnimatePresence mode="wait">
                    {!analysisResults ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4"
                        >
                            <div className="text-center space-y-4 max-w-2xl">
                                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                                    Unlock Insights from Your Chats
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Upload your WhatsApp chat export to visualize sentiment trends,
                                    participant activity, and emotional dynamics.
                                </p>
                            </div>
                            <FileUpload onAnalysisComplete={setAnalysisResults} />

                            {/* SEO Content Section */}
                            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full text-left">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Sentiment Analysis</h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    Advanced NLP algorithms analyze the emotional tone of every message, categorizing them into positive, neutral, or negative sentiments to reveal the underlying mood of your conversations.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold shrink-0">2</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Activity Tracking</h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    Visualize chat patterns with hourly activity heatmaps and response time analysis. Understand when your group is most active and who responds the fastest.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0">3</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Participant Insights</h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    Deep dive into individual behaviors with word clouds, emoji usage statistics, and conversation initiation metrics to see who drives the discussion.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Technology Stack</h3>
                                    <p className="text-gray-600">
                                        Built with modern web technologies for performance and privacy. Your data is processed locally and securely.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> React & Vite
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Tailwind CSS
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Recharts
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Framer Motion
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> FastAPI (Python)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> NLTK
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> VaderSentiment
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pandas
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-4 max-w-2xl">
                                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                                    The Code
                                </h2>
                                <p className="text-lg text-gray-600">
                                    The code for this application is available on GitHub&nbsp;
                                    <a
                                        href="https://github.com/LondonCityMedia/whatsapp-sentiment-analyzer"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-gray-900 transition-colors"
                                        title="View on GitHub"
                                    >
                                        here
                                    </a>
                                    .
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Dashboard data={analysisResults} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
