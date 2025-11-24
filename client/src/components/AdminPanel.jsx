import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Trash2, Filter, Search, ChevronDown, ChevronRight, X } from 'lucide-react';

const AdminPanel = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});
    const itemsPerPage = 20;
    const filterRef = React.useRef(null);

    const jobRoles = {
        "Project Management": [
            "Project Manager", "Deputy Project Manager", "Assistant Project Manager",
            "Planning Engineer", "Project Coordinator", "Site Incharge"
        ],
        "Engineering": [
            "Civil Engineer", "Structural Engineer", "Mechanical Engineer",
            "Electrical Engineer", "Instrumentation Engineer", "Design Engineer",
            "Quantity Surveyor (QS)", "QA/QC Engineer"
        ],
        "Construction & Site Execution": [
            "Site Engineer – Civil", "Site Engineer – Mechanical", "Site Engineer – Electrical",
            "Site Supervisor", "Safety Officer (EHS)", "Store Incharge / Store Keeper",
            "Land Surveyor", "Foreman (Civil/Mechanical/Electrical)", "P&M Supervisor / Operator"
        ],
        "Procurement & Contracts": [
            "Purchase Manager", "Senior Purchase Executive", "Procurement Executive",
            "Vendor Development Executive", "Contracts Engineer", "Billing Engineer"
        ],
        "Quality & Safety": [
            "QA Engineer", "QC Engineer", "Safety Manager", "EHS Supervisor", "Compliance Officer"
        ],
        "Planning & Cost Control": [
            "Planning Manager", "Planning & Billing Engineer", "Cost Control Engineer", "MIS Executive"
        ],
        "Admin & HR": [
            "HR Executive", "HR Manager", "Admin Executive", "Timekeeper"
        ],
        "Finance & Accounts": [
            "Accountant", "Finance Executive", "Payroll Executive", "Billing & Invoicing Executive"
        ],
        "Design & Drafting": [
            "AutoCAD Draughtsman", "BIM Modeler", "Revit Engineer"
        ]
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };

        if (showFilters) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters]);

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

    const handleDownload = (candidate) => {
        if (!candidate.resume_path) {
            alert('No resume file available for this candidate.');
            return;
        }
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const filename = candidate.resume_path.split(/[/\\]/).pop();
        const downloadUrl = `${API_URL}/uploads/${filename}`;
        window.open(downloadUrl, '_blank');
    };

    const handleView = (candidate) => {
        if (!candidate.resume_path) {
            alert('No resume file available for this candidate.');
            return;
        }
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const filename = candidate.resume_path.split(/[/\\]/).pop();
        const viewUrl = `${API_URL}/uploads/${filename}`;
        window.open(viewUrl + '#view', '_blank');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await axios.delete(`${API_URL}/api/candidates/${id}`);
            setCandidates(candidates.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting candidate:', error);
            alert('Failed to delete candidate.');
        }
    };

    const handleExport = () => {
        if (candidates.length === 0) {
            alert('No data to export.');
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Location', 'Experience (Years)', 'Skills', 'Education'];
        const csvContent = [
            headers.join(','),
            ...candidates.map(c => {
                const skills = Array.isArray(c.skills) ? c.skills.join(';') : c.skills;
                const education = Array.isArray(c.education) ? c.education.map(e => `${e.degree} at ${e.school}`).join(';') : c.education;
                return [
                    `"${c.name}"`,
                    `"${c.email}"`,
                    `"${c.phone}"`,
                    `"${c.location}"`,
                    c.experience_years,
                    `"${skills}"`,
                    `"${education}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'candidates_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const getCategoryCount = (category) => {
        const roles = jobRoles[category] || [];
        return candidates.filter(candidate => {
            const roleLower = roles.map(r => r.toLowerCase());
            const skillsMatch = Array.isArray(candidate.skills)
                ? candidate.skills.some(skill => roleLower.some(r => skill.toLowerCase().includes(r)))
                : candidate.skills && roleLower.some(r => candidate.skills.toLowerCase().includes(r));

            const resumeMatch = candidate.resume_text && roleLower.some(r => candidate.resume_text.toLowerCase().includes(r));
            return skillsMatch || resumeMatch;
        }).length;
    };

    // Filter logic
    const filteredCandidates = candidates.filter(candidate => {
        let matchesRole = true;
        let matchesSearch = true;

        if (selectedRole) {
            const roleLower = selectedRole.toLowerCase();
            const skillsMatch = Array.isArray(candidate.skills)
                ? candidate.skills.some(skill => skill.toLowerCase().includes(roleLower))
                : candidate.skills && candidate.skills.toLowerCase().includes(roleLower);

            const resumeMatch = candidate.resume_text && candidate.resume_text.toLowerCase().includes(roleLower);
            matchesRole = skillsMatch || resumeMatch;
        }

        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            const nameMatch = candidate.name && candidate.name.toLowerCase().includes(queryLower);
            const emailMatch = candidate.email && candidate.email.toLowerCase().includes(queryLower);
            const locationMatch = candidate.location && candidate.location.toLowerCase().includes(queryLower);
            const skillsMatch = Array.isArray(candidate.skills)
                ? candidate.skills.some(skill => skill.toLowerCase().includes(queryLower))
                : candidate.skills && candidate.skills.toLowerCase().includes(queryLower);

            matchesSearch = nameMatch || emailMatch || locationMatch || skillsMatch;
        }

        return matchesRole && matchesSearch;
    });

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
        backgroundColor: 'transparent',
        cursor: 'pointer',
        border: 'none'
    };

    return (
        <div style={{ marginTop: '2.5rem' }}>
            <div className="flex-between mb-6" style={{ alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Database</h1>
                    <p className="page-subtitle">Manage your candidate pool.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="input-group">
                        <Search size={20} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '1rem', width: '320px' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }} ref={filterRef}>
                        <button
                            className="btn-secondary"
                            style={{
                                fontSize: '1rem',
                                padding: '0.75rem 1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: showFilters ? '#F3F4F6' : 'white'
                            }}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={20} />
                            {selectedRole || 'Filter by Role'}
                            {selectedRole && (
                                <X
                                    size={16}
                                    style={{ marginLeft: '0.25rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRole('');
                                    }}
                                />
                            )}
                        </button>

                        {showFilters && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                width: '300px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #E5E7EB',
                                zIndex: 50,
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>
                                    Select Job Role
                                </div>
                                <div>
                                    {Object.entries(jobRoles).map(([category, roles]) => (
                                        <div key={category}>
                                            <div
                                                onClick={() => toggleCategory(category)}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    fontSize: '0.875rem',
                                                    color: '#4B5563',
                                                    backgroundColor: expandedCategories[category] ? '#F9FAFB' : 'white',
                                                    borderBottom: '1px solid #F3F4F6'
                                                }}
                                            >
                                                <span style={{ fontWeight: '500' }}>{category} ({getCategoryCount(category)})</span>
                                                {expandedCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </div>
                                            {expandedCategories[category] && (
                                                <div style={{ backgroundColor: '#F9FAFB' }}>
                                                    {roles.map(role => (
                                                        <div
                                                            key={role}
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                setShowFilters(false);
                                                            }}
                                                            style={{
                                                                padding: '0.5rem 0.75rem 0.5rem 1.5rem',
                                                                fontSize: '0.875rem',
                                                                color: selectedRole === role ? '#2563EB' : '#6B7280',
                                                                cursor: 'pointer',
                                                                backgroundColor: selectedRole === role ? '#EFF6FF' : 'transparent',
                                                                transition: 'background-color 0.1s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRole === role ? '#EFF6FF' : 'transparent'}
                                                        >
                                                            {role}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-primary"
                        style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
                        onClick={handleExport}
                    >
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
                        ) : filteredCandidates.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>No candidates found.</td>
                            </tr>
                        ) : (
                            (() => {
                                const indexOfLastItem = currentPage * itemsPerPage;
                                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);

                                return currentItems.map((candidate) => (
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
                                                <button
                                                    style={actionButtonStyle}
                                                    onClick={() => handleView(candidate)}
                                                    title="View Resume"
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#2563EB' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                </button>
                                                <button
                                                    style={actionButtonStyle}
                                                    onClick={() => handleDownload(candidate)}
                                                    title="Download Resume"
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#2563EB' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    style={actionButtonStyle}
                                                    onClick={() => handleDelete(candidate.id)}
                                                    title="Delete Candidate"
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#DC2626' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex-between" style={{ marginTop: '1rem', padding: '0 0.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
                <div>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCandidates.length)}-{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} results</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        style={{ padding: '0.25rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.6 : 1 }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <button
                        style={{ padding: '0.25rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: 'white', cursor: currentPage >= Math.ceil(filteredCandidates.length / itemsPerPage) ? 'not-allowed' : 'pointer', opacity: currentPage >= Math.ceil(filteredCandidates.length / itemsPerPage) ? 0.6 : 1 }}
                        disabled={currentPage >= Math.ceil(filteredCandidates.length / itemsPerPage)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
