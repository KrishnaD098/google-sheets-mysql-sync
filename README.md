# Google Sheets ↔ MySQL Two-Way Sync

A stable, timestamp-aware two-way synchronization system between **Google Sheets** and **MySQL**, built with **Node.js (Express)** and a **React + Vite dashboard**.

The system is designed to avoid common synchronization issues such as data reverts, infinite overwrite loops, empty JSON rows, and accidental deletions.

---

## Features

- Two-way synchronization between Google Sheets and MySQL
- MySQL as the single source of truth
- JSON-based dynamic schema (supports changing sheet headers)
- Automatic header creation in Google Sheets
- Empty row protection
- Manual sync control (no aggressive cron jobs)
- Sync status and health endpoints
- Visual sync alerts in the frontend
- React dashboard with live MySQL and Sheets preview

---

## Architecture
```
Google Sheets
      ↕
Node.js (Express API)
      ↕
MySQL (JSON rows)
      ↕
React + Vite Dashboard
```
## Tech Stack

| Category      | Technology                                      |
|---------------|-------------------------------------------------|
| **Backend**   | Node.js, Express.js                             |
| **Frontend**  | React, Vite                                     |
| **Database**  | MySQL (with `mysql2` driver)                    |
| **API & Auth**| Google Sheets API, Google Service Account         |

---

## Database Schema

The required database schema consists of a single table. The `data` column uses the `JSON` type to dynamically store row content, allowing for flexibility as the sheet's columns change.

```sql
CREATE TABLE sheet_rows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data JSON NOT NULL,
  updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Project Structure

```
google-sheets-mysql-sync/
├── backend/
│   ├── .env               # Local environment variables (untracked)
│   ├── db.js              # MySQL connection setup
│_  ├── index.js           # Express server and API endpoints
│   ├── mysqlToSheets.js   # MySQL -> Sheets sync logic
│   ├── package.json
│   ├── sheets.js          # Google Sheets API setup
│   └── sync.js            # Sheets -> MySQL sync logic
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main dashboard component
│   │   └── DataTable.jsx  # Component for previewing data
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Environment and Setup

### 1. Google Service Account

Before running the project, you need a Google Service Account to grant the backend permission to access your Google Sheet.

1.  **Create a Service Account:** Go to the [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a new service account.
2.  **Create JSON Key:** After creating the account, generate a JSON key and download it.
3.  **Share Your Sheet:** Open your Google Sheet and share it with the `client_email` found in the downloaded JSON key file (e.g., `your-service-account@...gserviceaccount.com`).

### 2. Backend Environment Variables

Create a `.env` file in the `backend/` directory and add the following variables.

```env
# Server
PORT=5000

# MySQL Connection
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_database

# Google Sheets
SHEET_ID=your_google_sheet_id
GOOGLE_CREDENTIALS=
```

**Important:** Copy the entire content of your downloaded service account JSON key and paste it into the `GOOGLE_CREDENTIALS` variable. It should be a single-line string.

Example:
`GOOGLE_CREDENTIALS={"type": "service_account", "project_id": "...", ...}`

### 3. Cron Job Automation

This project includes a default cron job that automatically syncs data from Google Sheets to MySQL every 10 seconds. This provides timely updates from the sheet without requiring manual intervention.

- **Sheets → MySQL:** Runs every 10 seconds (`*/10 * * * * *`).
- **MySQL → Sheets:** This direction is intentionally manual and must be triggered via an API call to maintain MySQL as the source of truth. An automated cron job for this is disabled by default in `backend/index.js`.

---

## Local Development

#### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Run the Application
```bash
# Run the backend server (from the backend/ directory)
node index.js
# The backend will be available at http://localhost:5000

# Run the frontend dev server (from the frontend/ directory)
npm run dev
# The frontend will be available at http://localhost:5173
```

---

## API Endpoints

The backend exposes the following endpoints for synchronization, status checks, and data previews.

| Method | Endpoint                    | Description                                                                 |
|--------|-----------------------------|-----------------------------------------------------------------------------|
| `POST` | `/sync-both`                | **(Recommended)** Performs a full two-way sync: Sheets → MySQL, then MySQL → Sheets. |
| `POST` | `/sync-now`                 | Performs a one-way sync from Google Sheets to MySQL.                        |
| `POST` | `/sync-mysql-to-sheets`     | Performs a one-way sync from MySQL to Google Sheets.                        |
| `GET`  | `/health`                   | A simple health check endpoint. Returns `{ "status": "ok" }`.                 |
| `GET`  | `/status`                   | Checks and returns the connection status for MySQL and Google Sheets.       |
| `GET`  | `/rows/latest`              | Returns the last 10 rows from the MySQL database.                           |
| `GET`  | `/sheets/latest`            | Returns the last 10 rows from the Google Sheet.                             |

### Deleting Data

To ensure data integrity, rows must be deleted from the database first. The changes will propagate to Google Sheets upon the next sync.

1.  **Delete from MySQL:**
    ```sql
    -- Disable safe updates to allow deletion by non-primary key
    SET SQL_SAFE_UPDATES = 0;

    -- Delete specific rows by their database ID
    DELETE FROM sheet_rows WHERE id IN (8, 9, 10);

    -- Re-enable safe updates
    SET SQL_SAFE_UPDATES = 1;
    ```

2.  **Trigger a Sync:**
    Call the `POST /sync-both` or `POST /sync-mysql-to-sheets` endpoint to update the Google Sheet.

## Troubleshooting
### Failed to fetch

- Backend is not running

- Incorrect API base URL

- Port mismatch between frontend and backend

### Google Sheets not syncing

- Missing or misplaced ```credentials.json```

- Google Sheet not shared with the service account

- Incorrect ```SHEET_ID```

### Rows reappearing

- Rows deleted in Sheets but not in MySQL

- Sync not triggered after database changes

---

## Future Possibilities

-   **User Authentication & Authorization:** Implement secure login and role-based access control for the dashboard.
-   **Enhanced Error Handling & Logging:** More robust error reporting, detailed logging, and integration with monitoring tools.
-   **Support for Multiple Sheets/Tables:** Extend the system to synchronize with multiple Google Sheets or MySQL tables simultaneously.
-   **Dynamic Schema UI:** Develop a user interface for configuring and mapping Google Sheets headers to JSON keys in MySQL.
-   **Webhook Integration:** Explore using webhooks for real-time updates from Google Sheets instead of periodic polling.
-   **Data Versioning:** Implement a mechanism for tracking changes and reverting to previous versions of data.
-   **Performance Optimization:** Optimize sync operations for very large datasets.

---

## Keywords

Node.js, Express.js, React, Vite, MySQL, Google Sheets API, Two-Way Sync, Data Synchronization, JSON Schema, Service Account, Data Integrity, CRON, Database Management, Frontend Dashboard, Backend API, Full-stack Development, Data Consistency, API Integration, Real-time Sync (potential), Scalability.
