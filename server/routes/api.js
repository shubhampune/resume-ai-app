const express = require('express');
const multer = require('multer');
const path = require('path');
const { extractText, parseResume } = require('../services/parser');
const db = require('../services/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//const upload = multer({ storage: storage });

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded credentials for demo
    if (username === 'admin' && password === 'password') {
        res.json({
            success: true,
            user: {
                id: 1,
                name: 'Administrator',
                email: 'admin@resumeai.com'
            },
            token: 'demo-token-12345'
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
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

module.exports = router;
