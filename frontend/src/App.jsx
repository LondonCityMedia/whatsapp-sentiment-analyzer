import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

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
