import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Trash2, Filter, Search } from 'lucide-react';

const AdminPanel = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${API_URL}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    // Inline styles for table
    const tableHeaderStyle = {
        padding: '1.25rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB',
        textAlign: 'left'
    };

    const tableCellStyle = {
        padding: '1.25rem',
        borderBottom: '1px solid #F3F4F6',
        verticalAlign: 'middle'
    };

    const avatarStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#4B5563',
        flexShrink: 0
    };

    const skillTagStyle = {
        padding: '0.125rem 0.5rem',
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: '1px solid #DBEAFE',
        display: 'inline-block'
    };

    const actionButtonStyle = {
        padding: '0.375rem',
        borderRadius: '4px',
        color: '#6B7280',
        transition: 'all 0.2s ease',
        backgroundColor: 'transparent'
    };

    return (
        <div style={{ marginTop: '2.5rem' }}>
            <div className="flex-between mb-6" style={{ alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Database</h1>
                    <p className="page-subtitle">Manage your candidate pool.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="input-group">
                        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input-field"
                            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.875rem', width: '240px' }}
                        />
                    </div>
                    <button className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', backgroundColor: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Candidate Name</th>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Skills</th>
                            <th style={tableHeaderStyle}>Experience</th>
                            <th style={tableHeaderStyle}>Location</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>Loading data...</td>
                            </tr>
                        ) : candidates.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>No candidates found.</td>
                            </tr>
                        ) : (
                            candidates.map((candidate) => (
                                <tr key={candidate.id} style={{ transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={avatarStyle}>
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{candidate.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                            {candidate.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} style={skillTagStyle}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', alignSelf: 'center', paddingLeft: '0.25rem' }}>+{candidate.skills.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ ...tableCellStyle, fontSize: '0.875rem', color: '#4B5563' }}>{candidate.experience_years} Years</td>
                                    <td style={{ ...tableCellStyle, fontSize: '0.875rem', color: '#4B5563' }}>{candidate.location}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button style={actionButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#2563EB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}>
                                                <Download size={16} />
                                            </button>
                                            <button style={actionButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#DC2626' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex-between" style={{ marginTop: '1rem', padding: '0 0.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
                <div>Showing {candidates.length} results</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ padding: '0.25rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: 'white', cursor: 'not-allowed', opacity: 0.6 }} disabled>Previous</button>
                    <button style={{ padding: '0.25rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: 'white', cursor: 'not-allowed', opacity: 0.6 }} disabled>Next</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
