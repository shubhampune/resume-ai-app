import React from 'react';

const DocumentationPage = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '2.5rem auto 0' }}>
            <div className="page-header">
                <h1 className="page-title" style={{ color: '#2d4899' }}>Documentation</h1>
                <p className="page-subtitle">
                    User guides and system documentation.
                </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'white', borderRadius: '10px', minHeight: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', color: '#6B7280' }}>
                    <p>Documentation coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
