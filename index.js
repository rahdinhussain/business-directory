const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Open SQLite database (creates db.sqlite if not exists)
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite');
  }
});

// Helper: turn query results into HTML table
function resultsToTable(results) {
  if (!results || results.length === 0) return '<p>No data.</p>';
  let html = '<table border="1" style="margin-top:10px;"><tr>';
  Object.keys(results[0]).forEach(k => html += `<th>${k}</th>`);
  html += '</tr>';
  results.forEach(row => {
    html += '<tr>';
    Object.values(row).forEach(v => html += `<td>${v}</td>`);
    html += '</tr>';
  });
  html += '</table>';
  return html;
}

// Home
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Projection
app.get('/projection', (req, res) => res.sendFile(path.join(__dirname, 'public', 'projection.html')));
app.post('/projection', (req, res) => {
  db.all('SELECT Name, Email FROM JobSeeker WHERE UserID = ?', [req.body.userId], (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Projection</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Selection
app.get('/selection', (req, res) => res.sendFile(path.join(__dirname, 'public', 'selection.html')));
app.post('/selection', (req, res) => {
  db.all('SELECT * FROM JobPosting WHERE Department = ?', [req.body.department], (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Selection</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Join
app.get('/join', (req, res) => res.sendFile(path.join(__dirname, 'public', 'join.html')));
app.post('/join', (req, res) => {
  const sql = `
    SELECT JobSeeker.Name, JobSeeker.Phone
    FROM JobSeeker
    JOIN Apply_For ON JobSeeker.UserID = Apply_For.UserID
    JOIN JobPosting ON Apply_For.PostID = JobPosting.PostID
    JOIN OfferedBy ON JobPosting.PostID = OfferedBy.PostID
    WHERE OfferedBy.Title = ?`;
  db.all(sql, [req.body.title], (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Join</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Division
app.get('/division', (req, res) => res.sendFile(path.join(__dirname, 'public', 'division.html')));
app.post('/division', (req, res) => {
  const sql = `
    SELECT UserID, Name
    FROM JobSeeker
    WHERE NOT EXISTS (
      SELECT * FROM JobPosting
      WHERE Department = ?
        AND NOT EXISTS (
          SELECT * FROM Apply_For
          WHERE Apply_For.UserID = JobSeeker.UserID
            AND Apply_For.PostID = JobPosting.PostID
        )
    )`;
  db.all(sql, [req.body.department], (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Division</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Aggregation 1 (COUNT)
app.get('/agg1', (req, res) => {
  db.all('SELECT COUNT(NumberOfShares) AS TotalShares FROM OwnedBy', (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Aggregation 1</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Aggregation 2 (MAX)
app.get('/agg2', (req, res) => {
  db.all('SELECT MAX(MarketCap) AS MaxMarketCap FROM Stock', (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Aggregation 2</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Nested Aggregation
app.get('/nested', (req, res) => {
  const sql = `SELECT AVG(app_cnt) AS AvgApplicationsPerSeeker
               FROM (SELECT COUNT(PostID) AS app_cnt FROM Apply_For GROUP BY UserID)`;
  db.all(sql, (err, rows) => {
    if (err) throw err;
    res.send(`<h2>Nested Aggregation</h2>${resultsToTable(rows)}<br><a href="/">Back</a>`);
  });
});

// Delete (cascade)
app.get('/delete', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delete.html')));
app.post('/delete', (req, res) => {
  db.run('DELETE FROM Company WHERE CompanyID = ?', [req.body.companyId], (err) => {
    if (err) throw err;
    res.send(`<h2>Deleted company ${req.body.companyId}</h2><p>Related data removed (cascade).</p><a href="/">Back</a>`);
  });
});

// Update
app.get('/update', (req, res) => res.sendFile(path.join(__dirname, 'public', 'update.html')));
app.post('/update', (req, res) => {
  db.run('UPDATE Stock SET Price = ? WHERE StockSymbol = ?', [req.body.price, req.body.stockSymbol], (err) => {
    if (err) throw err;
    res.send(`<h2>Updated price for ${req.body.stockSymbol}</h2><a href="/">Back</a>`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));