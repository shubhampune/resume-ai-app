import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Lock, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const [view, setView] = useState('initial'); // 'initial', 'login', 'signup'

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Registration State
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.post(`${API_URL}/api/login`, {
                username,
                password
            });

            if (response.data.success) {
                login(response.data.user);
                navigate('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Registration Logic
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newUser = {
                id: Date.now(),
                name: regName,
                email: `${regUsername}@example.com`, // Mock email
                username: regUsername
            };

            login(newUser);
            navigate('/');
        } catch (err) {
            setError('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // Inline styles for Login Page to match Daylight theme
    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6'
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2.5rem'
    };

    const logoStyle = {
        width: '48px',
        height: '48px',
        backgroundColor: '#2563EB',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
    };

    const inputLabelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '0.5rem'
    };

    const backButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#6B7280',
        fontSize: '0.875rem',
        marginBottom: '1.5rem',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0
    };

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <div style={logoStyle}>
                    <FileText size={24} color="white" />
                </div>

                <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                    {view === 'initial' ? 'Welcome' : view === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '2rem' }}>
                    {view === 'initial' ? 'Choose an option to continue' : view === 'login' ? 'Sign in to access your dashboard' : 'Sign up to get started'}
                </p>

                {view === 'initial' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={() => setView('login')}
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.75rem' }}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setView('signup')}
                            className="btn-secondary"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                border: '1px solid #D1D5DB',
                                color: '#374151',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {view === 'login' && (
                    <>
                        <button onClick={() => setView('initial')} style={backButtonStyle}>
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={inputLabelStyle}>Username</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={inputLabelStyle}>Password</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#991B1B',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.75rem' }}
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                    </>
                )}

                {view === 'signup' && (
                    <>
                        <button onClick={() => setView('initial')} style={backButtonStyle}>
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={inputLabelStyle}>Full Name</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={inputLabelStyle}>Username</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={inputLabelStyle}>Password</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="Choose a password"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#991B1B',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.75rem' }}
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
