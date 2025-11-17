const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('db.sqlite');

// === API: All businesses ===
app.get('/api/businesses', (req, res) => {
  const sql = `
    SELECT c.CompanyID, c.CompanyName, ch.Category, ch.Location, ch.Website, 
           s.StockSymbol, s.Price, s.MarketCap
    FROM Company c
    JOIN Company_hasA ch ON c.CompanyID = ch.CompanyID
    JOIN Stock s ON ch.StockSymbol = s.StockSymbol`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

// === STATS: COUNT, MAX, NESTED ===
// === STATS ROUTE ===
app.get('/stats', (req, res) => {
  db.get('SELECT COALESCE(SUM(NumberOfShares), 0) AS totalShares FROM OwnedBy', (err, row1) => {
    db.get('SELECT COALESCE(MAX(MarketCap), 0) AS maxCap FROM Stock', (err, row2) => {
      db.get(`
        SELECT COALESCE(AVG(cnt), 0) AS avgApps FROM (
          SELECT COUNT(PostID) AS cnt FROM Apply_For GROUP BY UserID
        )`, (err, row3) => {
        res.json({
          totalShares: row1.totalShares,
          maxCap: row2.maxCap,
          avgApps: parseFloat(row3.avgApps).toFixed(1)
        });
      });
    });
  });
});

// === 1. Projection ===
app.post('/seeker', (req, res) => {
  db.get('SELECT Name, Email FROM JobSeeker WHERE UserID = ?', [req.body.userId], (err, row) => {
    res.json(row || { error: 'Not found' });
  });
});

// === 2. Selection ===
app.post('/jobs', (req, res) => {
  const dept = req.body.dept.trim();
  db.all('SELECT jp.*, ob.Title, ob.Level FROM JobPosting jp JOIN OfferedBy ob ON jp.PostID = ob.PostID WHERE LOWER(jp.Department) = LOWER(?)', [dept], (err, rows) => {
    res.json(rows);
  });
});

// === 3. Join: Applicants for company ===
app.post('/applicants', (req, res) => {
  const sql = `
    SELECT js.Name, js.Phone
    FROM JobSeeker js
    JOIN Apply_For af ON js.UserID = af.UserID
    JOIN JobPosting jp ON af.PostID = jp.PostID
    JOIN OfferedBy ob ON jp.PostID = ob.PostID
    WHERE ob.CompanyID = ?`;
  db.all(sql, [req.body.companyId], (err, rows) => {
    res.json(rows);
  });
});

// === 8. DELETE Company (CASCADE) ===
app.post('/delete', (req, res) => {
  db.run('DELETE FROM Company WHERE CompanyID = ?', [req.body.companyId], function(err) {
    if (err) return res.json({ success: false });
    res.json({ success: true, deleted: this.changes });
  });
});

// === 9. UPDATE Price + TRIGGER ===
app.post('/update', (req, res) => {
  const symbol = req.body.symbol;
  const price = parseFloat(req.body.price);
  if (isNaN(price)) return res.json({ success: false });

  db.run('UPDATE Stock SET Price = ? WHERE StockSymbol = ?', [price, symbol], function(err) {
    if (err || this.changes === 0) return res.json({ success: false });
    
    // Manually trigger MarketCap update
    db.run(`
      UPDATE Stock SET MarketCap = ? * (
        SELECT COALESCE(SUM(NumberOfShares), 0) FROM OwnedBy WHERE StockSymbol = ?
      ) WHERE StockSymbol = ?`, [price, symbol, symbol], () => {
      res.json({ success: true });
    });
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(3000, () => console.log('Server at http://localhost:3000'));