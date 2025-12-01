import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onAnalysisComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.txt')) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError("Please upload a valid .txt file");
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.txt')) {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a valid .txt file");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Assuming backend is running on localhost:8000
            const response = await axios.post('http://localhost:8000/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onAnalysisComplete(response.data);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.detail || err.message || "An error occurred during analysis";
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel p-8 text-center border-2 border-dashed transition-colors duration-300 ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full text-primary">
                        {uploading ? (
                            <Loader className="w-8 h-8 animate-spin" />
                        ) : file ? (
                            <FileText className="w-8 h-8" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {file ? file.name : "Upload WhatsApp Chat"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {file
                                ? "Ready to analyze"
                                : "Drag and drop your exported .txt file here, or click to browse"}
                        </p>
                    </div>

                    {!file && (
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                    )}

                    <div className="flex gap-3 mt-4">
                        {!file && (
                            <label
                                htmlFor="file-upload"
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                            >
                                Select File
                            </label>
                        )}

                        {file && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
                            >
                                {uploading ? "Analyzing..." : "Start Analysis"}
                            </button>
                        )}

                        {file && !uploading && (
                            <button
                                onClick={() => setFile(null)}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-red-500 text-sm mt-4 bg-red-50 px-4 py-2 rounded-lg"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FileUpload;
