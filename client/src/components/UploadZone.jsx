import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, CloudUpload, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const UploadZone = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'partial'

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setUploadStatus(null);
        setProgress({ current: 0, total: 0, success: 0, failed: 0 });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: true
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const totalFiles = files.length;
        let successCount = 0;
        let failedCount = 0;

        setProgress({ current: 0, total: totalFiles, success: 0, failed: 0 });

        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('resume', file);

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                successCount++;
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message;
                console.error(`Failed to upload ${file.name}:`, errorMessage);
                // Store the last error message to show to the user
                setUploadStatus(errorMessage);
                failedCount++;
            }

            // Update progress
            setProgress({
                current: i + 1,
                total: totalFiles,
                success: successCount,
                failed: failedCount
            });
        }

        setUploading(false);
        setFiles([]); // Clear queue after processing

        if (failedCount === 0) {
            setUploadStatus('success');
        } else if (successCount === 0) {
            setUploadStatus('error');
        } else {
            setUploadStatus('partial');
        }
    };

    // Inline styles
    const dropzoneStyle = {
        border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : '#D1D5DB'}`,
        backgroundColor: isDragActive ? 'var(--accent-light)' : '#F9FAFB',
        borderRadius: '10px',
        padding: '3rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        transition: 'all 0.2s ease',
        minHeight: '250px'
    };

    const iconCircleStyle = {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#EFF6FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.5rem'
    };

    const fileListStyle = {
        marginTop: '1.5rem',
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.5rem'
    };

    const fileItemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        borderBottom: '1px solid #F3F4F6',
        fontSize: '0.9rem'
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2.5rem auto 0' }}>
            <div className="page-header">
                <h1 className="page-title" style={{ color: '#2d4899' }}>Import Resumes</h1>
                <p className="page-subtitle">
                    Upload multiple candidate resumes (PDF, DOCX) to parse and add them to the database.
                </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'white' }}>
                <div {...getRootProps()} style={dropzoneStyle}>
                    <input {...getInputProps()} />
                    <div style={iconCircleStyle}>
                        <CloudUpload size={32} color="var(--accent-primary)" />
                    </div>
                    <div className="text-center">
                        <p style={{ fontWeight: '600', fontSize: '1.125rem', color: '#111827', marginBottom: '0.25rem' }}>
                            Drag & drop resumes here
                        </p>
                        <p style={{ color: '#6B7280' }}>or click to browse (Supports 500+ files)</p>
                    </div>
                </div>

                {/* File List Preview */}
                {files.length > 0 && (
                    <div style={fileListStyle}>
                        {files.map((file, index) => (
                            <div key={index} style={fileItemStyle}>
                                <div className="flex-center" style={{ gap: '0.75rem' }}>
                                    <FileText size={16} color="#6B7280" />
                                    <span style={{ color: '#374151', fontWeight: '500' }}>{file.name}</span>
                                    <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                {!uploading && (
                                    <button onClick={() => removeFile(index)} style={{ color: '#EF4444', padding: '4px' }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ fontWeight: '600', color: '#374151' }}>Uploading...</span>
                            <span style={{ color: '#6B7280' }}>{progress.current} / {progress.total}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(progress.current / progress.total) * 100}%`,
                                height: '100%',
                                backgroundColor: 'var(--accent-primary)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                )}

                <div className="flex-between" style={{ marginTop: '2rem', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                        className="btn-primary"
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing Batch...
                            </>
                        ) : (
                            `Import ${files.length > 0 ? `${files.length} Resumes` : 'Resumes'}`
                        )}
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
                {uploadStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            backgroundColor: uploadStatus === 'error' ? '#FEF2F2' : (uploadStatus === 'partial' ? '#FFFBEB' : '#ECFDF5'),
                            border: `1px solid ${uploadStatus === 'error' ? '#FECACA' : (uploadStatus === 'partial' ? '#FDE68A' : '#A7F3D0')}`,
                            color: uploadStatus === 'error' ? '#991B1B' : (uploadStatus === 'partial' ? '#92400E' : '#065F46')
                        }}
                    >
                        {uploadStatus === 'success' && <CheckCircle size={20} />}
                        {uploadStatus === 'error' && <AlertCircle size={20} />}
                        {uploadStatus === 'partial' && <AlertCircle size={20} />}

                        <div>
                            {uploadStatus === 'success' && `All ${progress.success} resumes successfully imported!`}
                            {(uploadStatus === 'error' || uploadStatus === 'partial') && (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>Batch finished. {progress.failed} failed.</span>
                                    {typeof uploadStatus === 'string' && (
                                        <span style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.9 }}>
                                            Last error: {uploadStatus}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadZone;
