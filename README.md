# Candidate Management System

A full-stack web application for managing candidate information during recruitment. It provides CRUD operations, search, filter, and a responsive UI with validation and confirmation dialogs.

## Features

- **CRUD**: Create, read, update, and delete candidate records
- **Search & filter**: Search by name, email, skills, position; filter by status
- **Validation**: Real-time and submit-time validation on frontend; backend validation and parameterized queries
- **UI**: Responsive table, modal forms for add/edit, delete confirmation dialog

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (via `pg`)
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Database**: PostgreSQL with schema constraints and indexes

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (installed and running)

## Setup

### 1. Create the database

In PostgreSQL (psql or pgAdmin), create a database:

```sql
CREATE DATABASE candidate_db;
```

### 2. Configure environment

From the project root:

```bash
cd backend
cp .env.example .env
``

### 3. Install dependencies and initialize schema

```bash
cd backend
npm install
npm run init-db
```

### 4. Start the application

```bash
npm start
```

- API: http://localhost:3000/api/candidates  
- Web UI: http://localhost:3000  

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/candidates | List all candidates (optional query: `search`, `status`) |
| GET | /api/candidates/:id | Get one candidate |
| POST | /api/candidates | Create a candidate |
| PUT | /api/candidates/:id | Update a candidate |
| DELETE | /api/candidates/:id | Delete a candidate |

## Database Schema

Table **candidates**:

- `id` – SERIAL PRIMARY KEY  
- `name` – VARCHAR(255), NOT NULL  
- `age` – INTEGER, NOT NULL, 18–120  
- `email` – VARCHAR(255), NOT NULL, UNIQUE  
- `phone` – VARCHAR(50)  
- `skills` – TEXT  
- `experience` – VARCHAR(100)  
- `applied_position` – VARCHAR(255)  
- `status` – VARCHAR(50), one of: Applied, Interviewing, Hired, Rejected  
- `created_at`, `updated_at` – timestamps  

## Security & data integrity

- Parameterized queries to prevent SQL injection  
- Input validation and sanitization on backend  
- Frontend validation and error display  
- Unique constraint on email; check constraints on age and status  

## Project structure

```
.
├── backend/
│   ├── db/connection.js
│   ├── middleware/validation.js
│   ├── routes/candidates.js
│   ├── scripts/init-db.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## Backup and recovery

- Use PostgreSQL backup tools (e.g. `pg_dump candidate_db > backup.sql`) for backups.  
- Restore with `psql candidate_db < backup.sql`.
