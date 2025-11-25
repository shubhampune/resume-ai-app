import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, ExternalLink, Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const CandidateModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const resumeUrl = `${API_URL}/${candidate.resume_path}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #2d4899 0%, #4F46E5 100%)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.5rem',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{candidate.name}</h2>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Candidate Profile</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'background-color 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    {/* Contact Information Section */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#2d4899',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Contact Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: '#DBEAFE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Mail size={20} color="#2563EB" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.125rem' }}>Email</div>
                                    <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.95rem' }}>{candidate.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: '#D1FAE5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Phone size={20} color="#059669" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.125rem' }}>Phone</div>
                                    <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.95rem' }}>{candidate.phone}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FEE2E2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <MapPin size={20} color="#DC2626" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.125rem' }}>Location</div>
                                    <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.95rem' }}>{candidate.location}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FEF3C7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Briefcase size={20} color="#D97706" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.125rem' }}>Experience</div>
                                    <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.95rem' }}>{candidate.experience_years} Years</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#2d4899',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>Skills & Expertise</span>
                            <span style={{
                                fontSize: '0.75rem',
                                backgroundColor: '#DBEAFE',
                                color: '#1E40AF',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '9999px',
                                fontWeight: '600'
                            }}>
                                {candidate.skills.length}
                            </span>
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {candidate.skills.map((skill, i) => (
                                <span key={i} style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#EFF6FF',
                                    color: '#1E40AF',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    border: '1px solid #DBEAFE',
                                    transition: 'all 0.2s'
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#2d4899',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <GraduationCap size={20} />
                            <span>Education</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {candidate.education.map((edu, i) => (
                                <div key={i} style={{
                                    padding: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    color: '#374151',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    borderLeft: '3px solid #2d4899'
                                }}>
                                    {edu}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resume Preview Section */}
                    <div>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#2d4899',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Resume Document</h3>
                        <div style={{
                            padding: '1.5rem',
                            border: '2px dashed #E5E7EB',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#F9FAFB',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#FEE2E2',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#DC2626'
                                }}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '1rem' }}>Original Resume File</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.125rem' }}>
                                        {candidate.resume_path.split('/').pop()}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#2d4899',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    textDecoration: 'none',
                                    transition: 'background-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(45, 72, 153, 0.2)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d4899'}
                            >
                                <ExternalLink size={18} />
                                View Resume
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CandidateModal;
