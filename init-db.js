const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS JobSeeker (
    UserID INTEGER PRIMARY KEY,
    Name TEXT,
    Email TEXT,
    Phone TEXT,
    Address TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Company (
    CompanyID INTEGER PRIMARY KEY,
    CompanyCategory TEXT NOT NULL,
    Location TEXT,
    Website TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Position_At (
    Title TEXT,
    Level TEXT,
    Department TEXT NOT NULL,
    CompanyID INTEGER,
    PRIMARY KEY (Title, Level, CompanyID),
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS JobPosting (
    PostID INTEGER PRIMARY KEY,
    DatePosted TEXT,
    Department TEXT NOT NULL,
    FullTime_PartTime TEXT NOT NULL,
    Accessibility TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS OfferedBy (
    PostID INTEGER PRIMARY KEY,
    CompanyID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Level TEXT NOT NULL,
    FOREIGN KEY (PostID) REFERENCES JobPosting(PostID) ON DELETE CASCADE,
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (Title, Level, CompanyID) REFERENCES Position_At(Title, Level, CompanyID)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Apply_For (
    UserID INTEGER,
    PostID INTEGER,
    ApplicationDate TEXT,
    PRIMARY KEY (UserID, PostID),
    FOREIGN KEY (UserID) REFERENCES JobSeeker(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES JobPosting(PostID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS IsAMotherCompanyOf (
    CompanyA_CompanyID INTEGER,
    CompanyB_CompanyID INTEGER PRIMARY KEY,
    FOREIGN KEY (CompanyA_CompanyID) REFERENCES Company(CompanyID),
    FOREIGN KEY (CompanyB_CompanyID) REFERENCES Company(CompanyID)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Stock (
    StockSymbol TEXT PRIMARY KEY,
    Price REAL,
    MarketCap REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Company_hasA_Stock (
    CompanyID INTEGER,
    StockSymbol TEXT PRIMARY KEY,
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (StockSymbol) REFERENCES Stock(StockSymbol) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Investor (
    InvestorID INTEGER PRIMARY KEY
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Individual_Investor (
    InvestorID INTEGER PRIMARY KEY,
    Individual_Name TEXT NOT NULL,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Corporate_Investor (
    InvestorID INTEGER PRIMARY KEY,
    Corporation TEXT NOT NULL,
    Corporate_Website TEXT,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS OwnedBy (
    StockSymbol TEXT,
    InvestorID INTEGER,
    NumberOfShares INTEGER,
    PRIMARY KEY (StockSymbol, InvestorID),
    FOREIGN KEY (StockSymbol) REFERENCES Stock(StockSymbol) ON DELETE CASCADE,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
  )`);

  // Trigger for bonus
  db.run(`CREATE TRIGGER IF NOT EXISTS update_marketcap
          AFTER UPDATE ON Stock
          FOR EACH ROW
          BEGIN
            UPDATE Stock
            SET MarketCap = NEW.Price * (SELECT COALESCE(SUM(NumberOfShares), 0) FROM OwnedBy WHERE StockSymbol = NEW.StockSymbol)
            WHERE StockSymbol = NEW.StockSymbol;
          END`);

  // Insert data (run only once)
  db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (1, 'Lyon Lee', 'llee@email.com', '604-123-4567', '123 Abc St')`);
  db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (2, 'Kinsey Weir', 'kin@email.com', '604-321-7654', '321 Cba St')`);
  db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (3, 'Fai Pat', 'fai@email.com', '604-213-0000', '213 Bac St')`);
  db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (4, 'Rahdin Hus', 'rah@email.com', '406-123-3333', '111 Bba St')`);
  db.run(`INSERT OR IGNORE INTO JobSeeker VALUES (5, 'Jhon Ross', 'jhon@email.com', '445-223-2233', '222 Aac st')`);

  db.run(`INSERT OR IGNORE INTO Company VALUES (111, 'Fin Tech', 'Vancouver', 'fintech.com')`);
  db.run(`INSERT OR IGNORE INTO Company VALUES (112, 'Software', 'Burnaby', 'isoft.com')`);
  db.run(`INSERT OR IGNORE INTO Company VALUES (113, 'Software', 'Burnaby', 'asoft.com')`);
  db.run(`INSERT OR IGNORE INTO Company VALUES (114, 'Software', 'Vancouver', 'usoft.com')`);
  db.run(`INSERT OR IGNORE INTO Company VALUES (115, 'Fin Tech', 'Port Moody', 'finit.com')`);

  db.run(`INSERT OR IGNORE INTO Position_At VALUES ('Junior Analyst', 'Entry', 'Finance', 111)`);
  db.run(`INSERT OR IGNORE INTO Position_At VALUES ('Web Developer', 'Senior', 'IT', 112)`);
  db.run(`INSERT OR IGNORE INTO Position_At VALUES ('Senior Accountant', 'Senior', 'Accounting', 113)`);
  db.run(`INSERT OR IGNORE INTO Position_At VALUES ('Recruiting Lead', 'Senior', 'HR', 114)`);
  db.run(`INSERT OR IGNORE INTO Position_At VALUES ('Supply Chain Assistant', 'Entry', 'Logistics', 115)`);

  db.run(`INSERT OR IGNORE INTO JobPosting VALUES (1, '2025-01-23', 'Finance', 'Fulltime', 'ASL interpreter')`);
  db.run(`INSERT OR IGNORE INTO JobPosting VALUES (2, '2025-01-24', 'IT', 'Parttime', 'Remote work')`);
  db.run(`INSERT OR IGNORE INTO JobPosting VALUES (3, '2025-01-25', 'Accounting', 'Fulltime', 'Accessible park')`);
  db.run(`INSERT OR IGNORE INTO JobPosting VALUES (4, '2025-01-26', 'HR', 'Fulltime', 'No')`);
  db.run(`INSERT OR IGNORE INTO JobPosting VALUES (5, '2025-01-27', 'Logistics', 'Parttime', 'Speech-to-text')`);

  db.run(`INSERT OR IGNORE INTO OfferedBy VALUES (1, 111, 'Junior Analyst', 'Entry')`);
  db.run(`INSERT OR IGNORE INTO OfferedBy VALUES (2, 112, 'Web Developer', 'Senior')`);
  db.run(`INSERT OR IGNORE INTO OfferedBy VALUES (3, 113, 'Senior Accountant', 'Senior')`);
  db.run(`INSERT OR IGNORE INTO OfferedBy VALUES (4, 114, 'Recruiting Lead', 'Senior')`);
  db.run(`INSERT OR IGNORE INTO OfferedBy VALUES (5, 115, 'Supply Chain Assistant', 'Entry')`);

  db.run(`INSERT OR IGNORE INTO Apply_For VALUES (1, 1, '2025-03-23')`);
  db.run(`INSERT OR IGNORE INTO Apply_For VALUES (2, 2, '2025-03-24')`);
  db.run(`INSERT OR IGNORE INTO Apply_For VALUES (3, 3, '2025-03-25')`);
  db.run(`INSERT OR IGNORE INTO Apply_For VALUES (4, 4, '2025-03-26')`);
  db.run(`INSERT OR IGNORE INTO Apply_For VALUES (5, 5, '2025-03-27')`);

  db.run(`INSERT OR IGNORE INTO IsAMotherCompanyOf VALUES (111, 112)`);
  db.run(`INSERT OR IGNORE INTO IsAMotherCompanyOf VALUES (113, 114)`);
  db.run(`INSERT OR IGNORE INTO IsAMotherCompanyOf VALUES (115, 113)`);
  db.run(`INSERT OR IGNORE INTO IsAMotherCompanyOf VALUES (112, 115)`);
  db.run(`INSERT OR IGNORE INTO IsAMotherCompanyOf VALUES (114, 111)`);

  db.run(`INSERT OR IGNORE INTO Stock VALUES ('FNT', 20.00, 5000000.00)`);
  db.run(`INSERT OR IGNORE INTO Stock VALUES ('ISOF', 30.00, 8000000.00)`);
  db.run(`INSERT OR IGNORE INTO Stock VALUES ('ASOF', 25.00, 2000000.00)`);
  db.run(`INSERT OR IGNORE INTO Stock VALUES ('USOF', 5.00, 12000000.00)`);
  db.run(`INSERT OR IGNORE INTO Stock VALUES ('FNIT', 50.00, 10000000.00)`);

  db.run(`INSERT OR IGNORE INTO Company_hasA_Stock VALUES (111, 'FNT')`);
  db.run(`INSERT OR IGNORE INTO Company_hasA_Stock VALUES (112, 'ISOF')`);
  db.run(`INSERT OR IGNORE INTO Company_hasA_Stock VALUES (113, 'ASOF')`);
  db.run(`INSERT OR IGNORE INTO Company_hasA_Stock VALUES (114, 'USOF')`);
  db.run(`INSERT OR IGNORE INTO Company_hasA_Stock VALUES (115, 'FNIT')`);

  db.run(`INSERT OR IGNORE INTO Investor VALUES (1001)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (1002)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (1003)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (1004)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (1005)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (2001)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (2002)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (2003)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (2004)`);
  db.run(`INSERT OR IGNORE INTO Investor VALUES (2005)`);

  db.run(`INSERT OR IGNORE INTO Individual_Investor VALUES (1001, 'Alicia Adams')`);
  db.run(`INSERT OR IGNORE INTO Individual_Investor VALUES (1002, 'Emily Robinson')`);
  db.run(`INSERT OR IGNORE INTO Individual_Investor VALUES (1003, 'John Schmidt')`);
  db.run(`INSERT OR IGNORE INTO Individual_Investor VALUES (1004, 'Michael Cox')`);
  db.run(`INSERT OR IGNORE INTO Individual_Investor VALUES (1005, 'Davis Nagel')`);

  db.run(`INSERT OR IGNORE INTO Corporate_Investor VALUES (2001, 'VanIT Corp', 'vanit.ca')`);
  db.run(`INSERT OR IGNORE INTO Corporate_Investor VALUES (2002, 'CanInvest Group', 'caninvest.ca')`);
  db.run(`INSERT OR IGNORE INTO Corporate_Investor VALUES (2003, 'Maple Financial Group', 'maplefinancial.ca')`);
  db.run(`INSERT OR IGNORE INTO Corporate_Investor VALUES (2004, 'WestCoast Logistics', 'westcoastlogistics.ca')`);
  db.run(`INSERT OR IGNORE INTO Corporate_Investor VALUES (2005, 'BCConsulting', 'bcconsulting.ca')`);

  db.run(`INSERT OR IGNORE INTO OwnedBy VALUES ('FNT', 2001, 1000)`);
  db.run(`INSERT OR IGNORE INTO OwnedBy VALUES ('ISOF', 1002, 2000)`);
  db.run(`INSERT OR IGNORE INTO OwnedBy VALUES ('ASOF', 2003, 1500)`);
  db.run(`INSERT OR IGNORE INTO OwnedBy VALUES ('USOF', 1004, 500)`);
  db.run(`INSERT OR IGNORE INTO OwnedBy VALUES ('FNIT', 2005, 5000)`);

  console.log('Database initialized with tables and data.');
});

db.close();