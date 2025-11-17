# Business Directory – CPSC 2221 Final Project

**Project Title:** Business Directory  
**Course:** CPSC 2221 – Database Systems  
**Semester:** Fall 2025  
**Submission Date:** November 17, 2025

### Team Members
| # | Student Name          | Student ID | Email                     |
|---|-----------------------|------------|---------------------------|
| 1 | Le Yi Deng            | 10043435   | ldeng09@mylangara.ca      |
| 2 | Pattiya Preechawit    | 10044617   | ppreechawit00@mylangara.ca|
| 3 | Kinsey Weir           | 100400718  | kweir04@mylangara.ca      |
| 4 | Rahdin Hussain        | 100439392  | rhussain03@mylangara.ca   |

### Project Overview
A modern business directory that connects job seekers, companies, and investors.  
Users can:
- Browse publicly traded companies with real-time stock data
- Search job seekers by student/ID
- Find job postings by department
- View applicants for each company
- See live statistics (total shares owned, highest market cap, average applications)
- Update stock prices (triggers automatic MarketCap recalculation)
- Delete companies (ON DELETE CASCADE removes all related data)

### Features Implemented (All 9 Required SQL Concepts)
1. Projection – Search JobSeeker by ID → Name + Email  
2. Selection – Find jobs by department  
3. Join – Show applicants for a selected company  
4. Aggregation (COUNT) – Total shares owned across all investors  
5. Aggregation (MAX) – Highest market capitalization  
6. Nested aggregation – Average number of applications per seeker  
7. Trigger – MarketCap automatically updates when stock price changes  
8. DELETE with CASCADE – Removing a company deletes postings, applications, etc.  
9. UPDATE – Stock price update with trigger

### Technology Stack
- Node.js + Express (backend)
- SQLite3 (database)
- Plain HTML + CSS + vanilla JavaScript (frontend – single-page app)
- No external frameworks or libraries

### How to Run the Project
```bash
# 1. Install dependencies (only once)
npm install sqlite3 express

# 2. Create and populate the database
node init-db.js

# 3. Start the server
node index.js