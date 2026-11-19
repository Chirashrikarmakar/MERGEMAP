# MERGEMAP

### GitHub Pull Request Risk Analysis Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://mergemap.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Frontend-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://www.mongodb.com/atlas)

**MERGEMAP** is a full-stack web application that analyzes GitHub Pull Requests and identifies potential code-change risks before they are merged.

It evaluates pull request metadata and changed files, calculates a risk score, highlights potential risk factors, and generates a review checklist to help developers make more informed code review decisions.

**Live Application:** https://mergemap.onrender.com

**GitHub Repository:** https://github.com/Chirashrikarmakar/MERGEMAP

---

## Features

- **Pull Request Analysis:** Analyze public GitHub Pull Requests using their URLs.
- **Automated Risk Scoring:** Calculate a risk score out of 100 using rule-based analysis.
- **Risk Classification:** Categorize results into LOW, MEDIUM, HIGH, and CRITICAL levels.
- **Changed File Analysis:** Examine modified files, additions, deletions, and change volume.
- **Risk Detection:** Identify potentially sensitive changes involving authentication, security, databases, infrastructure, dependencies, and other areas.
- **Actionable Review Checklist:** Generate suggested review points based on detected risks.
- **Analysis Dashboard:** View analysis statistics, risk distribution, and recent activity.
- **Analysis History:** Store and revisit previously analyzed pull requests.
- **Detailed Reports:** Inspect individual analysis results, detected risks, and recommendations.

## How It Works

1. The user submits a public GitHub Pull Request URL.
2. The backend retrieves pull request information and changed-file details through the GitHub API.
3. The risk engine evaluates changes using predefined rules and heuristics.
4. Potential risk factors are identified and a risk score is calculated.
5. The application classifies the overall risk and generates a review checklist.
6. The analysis is saved in MongoDB Atlas.
7. Results are displayed on the dashboard and made available through analysis history.

## Risk Analysis Factors

MERGEMAP evaluates several aspects of a pull request, including:

| Risk Area | What It Evaluates |
|---|---|
| Authentication & Security | Changes to authentication and security-sensitive code |
| Database | Database-related changes and migrations |
| Dependencies | Changes to project dependencies |
| Infrastructure | Deployment and configuration changes |
| Deleted Files | Potential impact of removed files |
| Change Volume | Large pull requests with substantial modifications |
| Testing | Code changes without corresponding test-file changes |

Risk scores are heuristic indicators intended to support human code review. They are not a guarantee that a pull request is safe or free from vulnerabilities.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- JavaScript
- Mongoose
- Axios

### Database
- MongoDB Atlas

### External API
- GitHub REST API

### Deployment
- Render

## Project Structure

```text
MERGEMAP/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (20.19+ or a compatible newer version)
- npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Chirashrikarmakar/MERGEMAP.git
cd MERGEMAP
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
```

Replace the MongoDB placeholder with your own MongoDB Atlas connection string.

### 3. Configure the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
```

### 4. Run the Application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Open the application:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5000
```

## Deployment

MERGEMAP is deployed on Render as a single web service.

The Express server serves the production React build, while MongoDB Atlas provides cloud database storage.

**Live URL:** https://mergemap.onrender.com

## Future Improvements

- More advanced code-change analysis.
- Deeper security and vulnerability detection.
- Improved risk scoring and prioritization.
- Expanded review recommendations.
- Additional repository-level insights.

## Author

**Chirashri Karmakar**

B.Tech – Information Technology

GitHub: [@Chirashrikarmakar](https://github.com/Chirashrikarmakar)

---

*MERGEMAP — Understand the risks before merging the code.*
