// initDatabase.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./whitelist.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE,
    name TEXT,
    username TEXT UNIQUE
  )`);
    console.log('用户表已创建');
});

db.close();
