const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      skills TEXT,
      experience_years REAL,
      education TEXT,
      resume_text TEXT,
      resume_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      mobile TEXT,
      mobile_verified INTEGER DEFAULT 0,
      email_verified INTEGER DEFAULT 0
    )`, (err) => {
            if (!err) {
                // Check if admin exists, if not create
                db.get("SELECT * FROM users WHERE username = ?", ['admin'], (err, row) => {
                    if (!row) {
                        db.run("INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
                            ['admin', 'password', 'Administrator', 'admin@resumeai.com']);
                        console.log("Default admin user created.");
                    }
                });
            }
        });
    });
}

module.exports = db;
