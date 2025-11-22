const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
console.log("Current working directory:", process.cwd());
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
    console.log("GEMINI_API_KEY start:", process.env.GEMINI_API_KEY.substring(0, 5));
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api', require('./routes/api'));

// Basic route
app.get('/', (req, res) => {
    res.send('AI Resume Parser API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
