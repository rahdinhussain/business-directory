const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

module.exports = function() {
  const dbPath = path.join(__dirname, 'db.sqlite');
  
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // === ALL YOUR CREATE + INSERT STATEMENTS BELOW ===
    // (Copy from your original init-db.js – keep everything!)
    
    db.run(`CREATE TABLE IF NOT EXISTS JobSeeker (
      UserID INTEGER PRIMARY KEY,
      Name TEXT,
      Email TEXT,
      Phone TEXT,
      Address TEXT
    )`);

    // ... [ALL OTHER CREATE TABLE STATEMENTS] ...

    db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (1, 'Lyon Lee', 'llee@email.com', '604-123-4567', '123 Abc St')`);
    // ... [ALL INSERT STATEMENTS] ...

    console.log('Database created for Vercel');
  });

  db.close();
};