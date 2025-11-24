const express = require('express');
const multer = require('multer');
const path = require('path');
const { extractText, parseResume } = require('../services/parser');
const db = require('../services/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map(); // Format: { email/mobile: { otp: '123456', expires: timestamp } }

//const upload = multer({ storage: storage });

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (row) {
            res.json({
                success: true,
                user: {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    username: row.username,
                    mobile: row.mobile,
                    mobileVerified: row.mobile_verified === 1,
                    emailVerified: row.email_verified === 1
                },
                token: 'demo-token-' + row.id
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Change Password Endpoint
router.post('/change-password', (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    db.get("SELECT * FROM users WHERE id = ? AND password = ?", [userId, currentPassword], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (!row) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        db.run("UPDATE users SET password = ? WHERE id = ?", [newPassword, userId], function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to update password' });
            }
            res.json({ success: true, message: 'Password updated successfully' });
        });
    });
});

// Send OTP Endpoint
router.post('/send-otp', (req, res) => {
    const { contact, type } = req.body; // contact = email or mobile, type = 'email' or 'mobile'

    if (!contact || !type) {
        return res.status(400).json({ success: false, message: 'Contact and type are required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(contact, { otp, expires, type });

    // Simulated OTP - for production, integrate Twilio/SendGrid
    console.log(`\n🔐 OTP for ${type} ${contact}: ${otp}`);
    console.log(`⏰ Expires in 5 minutes\n`);

    res.json({
        success: true,
        message: `OTP sent to ${type}`,
        // For testing only - remove in production
        otp: otp
    });
});

// Verify OTP Endpoint
router.post('/verify-otp', (req, res) => {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
        return res.status(400).json({ success: false, message: 'Contact and OTP are required' });
    }

    const stored = otpStore.get(contact);

    if (!stored) {
        return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > stored.expires) {
        otpStore.delete(contact);
        return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP verified successfully
    otpStore.delete(contact);
    res.json({ success: true, message: 'OTP verified successfully' });
});

// Update Contact Information Endpoint
router.post('/update-contact', (req, res) => {
    const { userId, mobile, email, mobileVerified, emailVerified } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    let updates = [];
    let values = [];

    if (mobile !== undefined) {
        updates.push('mobile = ?');
        values.push(mobile);
    }
    if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
    }
    if (mobileVerified !== undefined) {
        updates.push('mobile_verified = ?');
        values.push(mobileVerified ? 1 : 0);
    }
    if (emailVerified !== undefined) {
        updates.push('email_verified = ?');
        values.push(emailVerified ? 1 : 0);
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
        if (err) {
            console.error('Error updating contact:', err);
            return res.status(500).json({ success: false, message: 'Failed to update contact information' });
        }

        // Fetch updated user data
        db.get("SELECT id, username, name, email, mobile, mobile_verified, email_verified FROM users WHERE id = ?", [userId], (err, row) => {
            if (err || !row) {
                return res.status(500).json({ success: false, message: 'Failed to fetch updated user data' });
            }

            res.json({
                success: true,
                message: 'Contact information updated successfully',
                user: {
                    id: row.id,
                    username: row.username,
                    name: row.name,
                    email: row.email,
                    mobile: row.mobile,
                    mobileVerified: row.mobile_verified === 1,
                    emailVerified: row.email_verified === 1
                }
            });
        });
    });
});

// Upload Resume
router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check for API Key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            return res.status(500).json({ error: 'Gemini API Key is missing. Please check server/.env' });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        // 1. Extract Text
        const text = await extractText(filePath, mimeType);

        // 2. Parse with AI
        const data = await parseResume(text);

        // 3. Save to DB
        const stmt = db.prepare(`
      INSERT INTO candidates (name, email, phone, location, skills, experience_years, education, resume_text, resume_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            data.name,
            data.email,
            data.phone,
            data.location,
            JSON.stringify(data.skills),
            data.experience_years,
            JSON.stringify(data.education),
            text,
            filePath,
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ id: this.lastID, ...data });
            }
        );
        stmt.finalize();

    } catch (error) {
        console.error("Upload Error Details:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        res.status(500).json({ error: error.message || "An unexpected error occurred" });
    }
});

// Search Candidates (Natural Language)
router.post('/search', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // NL to SQL
        const prompt = `
      You are a SQL expert. Convert the following natural language query into a SQL query for a SQLite database.
      
      Table Schema:
      candidates (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        location TEXT,
        skills TEXT (JSON array),
        experience_years REAL,
        education TEXT (JSON array),
        resume_text TEXT
      )
      
      Query: "${query}"
      
      Rules:
      - Return ONLY the SQL query.
      - Use LIKE for partial matches.
      - Handle JSON fields (skills, education) using LIKE or standard text search on the column.
      - Example: "Python developers in Pune" -> SELECT * FROM candidates WHERE skills LIKE '%Python%' AND location LIKE '%Pune%'
      
      SQL:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let sql = response.text().replace(/```sql/g, '').replace(/```/g, '').trim();

        console.log("Generated SQL:", sql);

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Search execution failed' });
            }
            // Parse JSON fields for frontend
            const candidates = rows.map(row => ({
                ...row,
                skills: JSON.parse(row.skills || '[]'),
                education: JSON.parse(row.education || '[]')
            }));
            res.json(candidates);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get All Candidates
router.get('/candidates', (req, res) => {
    db.all('SELECT * FROM candidates ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        const candidates = rows.map(row => ({
            ...row,
            skills: JSON.parse(row.skills || '[]'),
            education: JSON.parse(row.education || '[]')
        }));
        res.json(candidates);
    });
});

// Delete Candidate
router.delete('/candidates/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM candidates WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json({ message: 'Candidate deleted successfully' });
    });
});

module.exports = router;
