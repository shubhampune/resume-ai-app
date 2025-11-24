import React, { useState } from 'react';
import axios from 'axios';
import { Search, ArrowRight, Loader2, MapPin, Briefcase, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.post(`${API_URL}/api/search`, { query });
            setResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Inline styles for specific components
    const searchCardStyle = {
        position: 'sticky',
        top: '1rem',
        zIndex: 10,
        marginBottom: '2.5rem',
        padding: '0',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none'
    };

    const searchInputStyle = {
        flex: 1,
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '1rem',
        padding: '0 1.5rem',
        outline: 'none',
        color: '#111827',
        fontWeight: '400'
    };

    const resultCardStyle = {
        padding: '1.5rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        marginBottom: '1rem'
    };

    const avatarStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2d4899 0%, #4F46E5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '700',
        fontSize: '1.25rem',
        flexShrink: 0
    };

    const tagStyle = {
        padding: '0.25rem 0.625rem',
        backgroundColor: '#F3F4F6',
        color: '#374151',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: '1px solid #E5E7EB'
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2.5rem auto 0' }}>
            {/* Content Box */}
            <div style={{
                backgroundColor: '#F9FAFB',
                padding: '2rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                border: '1px solid #E5E7EB'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#2d4899',
                    marginBottom: '0.5rem'
                }}>
                    Candidate Search
                </h1>
                <p style={{
                    fontSize: '1rem',
                    color: '#6B7280',
                    marginBottom: '1.5rem'
                }}>
                    Find the perfect candidate using natural language queries.
                </p>

                {/* Search Input */}
                <div className="card" style={searchCardStyle}>
                    <form
                        onSubmit={handleSearch}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            border: '3px solid #4da83c',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(77, 168, 60, 0.15)'
                        }}
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find a civil engineer with 5 years in EPC projects"
                            style={searchInputStyle}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            style={{
                                padding: '1rem 2rem',
                                backgroundColor: '#4da83c',
                                border: 'none',
                                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'background-color 0.2s',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: 'white'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && query.trim()) {
                                    e.currentTarget.style.backgroundColor = '#3d8a30';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4da83c';
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} color="white" className="animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={20} color="white" />
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div>
                {loading ? (
                    <div className="text-center" style={{ padding: '5rem 0' }}>
                        <Loader2 size={40} color="var(--accent-primary)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6B7280' }}>Analyzing database...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div className="flex-between" style={{ padding: '0 0.25rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontWeight: '600', color: '#374151' }}>Search Results</h2>
                            <span style={{ fontSize: '0.875rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: '500' }}>
                                {results.length} Candidates Found
                            </span>
                        </div>

                        {results.map((candidate) => (
                            <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                                style={resultCardStyle}
                                whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                            >
                                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                                        <div style={avatarStyle}>
                                            {candidate.name.charAt(0)}
                                        </div>

                                        <div>
                                            <h3 style={{ fontWeight: '700', fontSize: '1.125rem', color: '#111827', marginBottom: '0.25rem' }}>
                                                {candidate.name}
                                            </h3>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                                                <div className="flex-center" style={{ gap: '0.375rem' }}>
                                                    <MapPin size={16} color="#9CA3AF" />
                                                    {candidate.location}
                                                </div>
                                                <div className="flex-center" style={{ gap: '0.375rem' }}>
                                                    <Briefcase size={16} color="#9CA3AF" />
                                                    {candidate.experience_years} Years Exp
                                                </div>
                                                <div className="flex-center" style={{ gap: '0.375rem' }}>
                                                    <User size={16} color="#9CA3AF" />
                                                    {candidate.email}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {candidate.skills.slice(0, 8).map((skill, i) => (
                                                    <span key={i} style={tagStyle}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ color: '#D1D5DB' }}>
                                        <ArrowRight size={24} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : hasSearched && (
                    <div className="card text-center" style={{ padding: '5rem 0', backgroundColor: 'white' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Search size={32} color="#9CA3AF" />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>No candidates found</h3>
                        <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>Try adjusting your search terms or upload more resumes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSearch;
