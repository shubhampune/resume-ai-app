import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Save, AlertCircle, CheckCircle, Phone, Mail, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user, login } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Contact verification states
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [email, setEmail] = useState(user?.email || '');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'mobile' or 'email'
    const [otpValue, setOtpValue] = useState('');
    const [otpContact, setOtpContact] = useState('');
    const [otpMessage, setOtpMessage] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState(''); // For testing display

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.post(`${API_URL}/api/change-password`, {
                userId: user.id,
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (type, contact) => {
        if (!contact) {
            setMessage({ type: 'error', text: `Please enter ${type === 'mobile' ? 'mobile number' : 'email address'}` });
            return;
        }

        setOtpLoading(true);
        setOtpMessage(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.post(`${API_URL}/api/send-otp`, {
                contact,
                type
            });

            if (response.data.success) {
                setOtpType(type);
                setOtpContact(contact);
                setShowOtpModal(true);
                setGeneratedOtp(response.data.otp); // For testing only
                setOtpMessage({ type: 'success', text: `OTP sent to ${type}` });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send OTP'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue) {
            setOtpMessage({ type: 'error', text: 'Please enter OTP' });
            return;
        }

        setOtpLoading(true);
        setOtpMessage(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Verify OTP
            const verifyResponse = await axios.post(`${API_URL}/api/verify-otp`, {
                contact: otpContact,
                otp: otpValue
            });

            if (verifyResponse.data.success) {
                // Update contact information
                const updateData = {
                    userId: user.id
                };

                if (otpType === 'mobile') {
                    updateData.mobile = otpContact;
                    updateData.mobileVerified = true;
                } else {
                    updateData.email = otpContact;
                    updateData.emailVerified = true;
                }

                const updateResponse = await axios.post(`${API_URL}/api/update-contact`, updateData);

                if (updateResponse.data.success) {
                    // Update user context
                    login(updateResponse.data.user);
                    setMessage({ type: 'success', text: `${otpType === 'mobile' ? 'Mobile number' : 'Email'} verified successfully` });
                    setShowOtpModal(false);
                    setOtpValue('');
                    setGeneratedOtp('');
                }
            }
        } catch (error) {
            setOtpMessage({
                type: 'error',
                text: error.response?.data?.message || 'Invalid OTP'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const closeOtpModal = () => {
        setShowOtpModal(false);
        setOtpValue('');
        setOtpMessage(null);
        setGeneratedOtp('');
    };

    return (
        <div style={{ marginTop: '2.5rem', maxWidth: '600px' }}>
            <div className="mb-6">
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Settings</h1>
                <p className="page-subtitle">Manage your account preferences.</p>
            </div>

            {message && (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: message.type === 'success' ? '#065F46' : '#991B1B',
                    border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                }}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{message.text}</span>
                </div>
            )}

            {/* Contact Verification Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                    <Shield size={20} color="#4B5563" />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Contact Verification</h2>
                </div>

                {/* Mobile Number */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Mobile Number
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="input-field"
                            style={{ flex: 1, padding: '0.625rem' }}
                            placeholder="+91 1234567890"
                            disabled={user?.mobileVerified}
                        />
                        {user?.mobileVerified ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                <CheckCircle size={16} />
                                Verified
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleSendOtp('mobile', mobile)}
                                disabled={otpLoading || !mobile}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Phone size={16} />
                                Verify
                            </button>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="form-group">
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Email Address
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            style={{ flex: 1, padding: '0.625rem' }}
                            placeholder="your@email.com"
                            disabled={user?.emailVerified}
                        />
                        {user?.emailVerified ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                <CheckCircle size={16} />
                                Verified
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleSendOtp('email', email)}
                                disabled={otpLoading || !email}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Mail size={16} />
                                Verify
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                    <Lock size={20} color="#4B5563" />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Change Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '0.625rem' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '0.625rem' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '0.625rem' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            <span>Updating...</span>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Update Password</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>Verify OTP</h3>
                            <button
                                onClick={closeOtpModal}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '0.25rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {otpMessage && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: otpMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                                color: otpMessage.type === 'success' ? '#065F46' : '#991B1B',
                                border: `1px solid ${otpMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                                fontSize: '0.875rem'
                            }}>
                                {otpMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {otpMessage.text}
                            </div>
                        )}

                        {generatedOtp && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FDE68A',
                                fontSize: '0.875rem',
                                textAlign: 'center'
                            }}>
                                <strong>Test OTP:</strong> {generatedOtp}
                            </div>
                        )}

                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                            Enter the OTP sent to {otpType === 'mobile' ? 'your mobile number' : 'your email'}
                        </p>

                        <input
                            type="text"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }}
                            placeholder="000000"
                            maxLength="6"
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={closeOtpModal}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                className="btn-primary"
                                disabled={otpLoading || !otpValue}
                                style={{ flex: 1, opacity: (otpLoading || !otpValue) ? 0.7 : 1 }}
                            >
                                {otpLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
