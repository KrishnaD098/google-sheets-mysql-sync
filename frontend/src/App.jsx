import React, { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

// 🔗 Put your actual Google Sheet URL here
const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1sx6TBw5eksnRQ7ln4l2lZbT9-xSp7nq40xWpCXWPs38/edit?gid=0#gid=0";

function App() {
    const [status, setStatus] = useState(null);
    const [mysqlRows, setMysqlRows] = useState([]);
    const [sheetData, setSheetData] = useState(null);

    const fetchStatus = async () => {
        const res = await fetch(`${API_BASE}/status`);
        setStatus(await res.json());
    };

    const fetchMysqlRows = async () => {
        const res = await fetch(`${API_BASE}/rows/latest`);
        setMysqlRows(await res.json());
    };

    const fetchSheetRows = async () => {
        const res = await fetch(`${API_BASE}/sheets/latest`);
        setSheetData(await res.json());
    };

    const manualSync = async () => {
        await fetch(`${API_BASE}/sync-now`, { method: "POST" });
        fetchMysqlRows();
        fetchSheetRows();
    };

    return (
        <div className="container">
            <h1>MySQL ↔ Google Sheets Sync Dashboard</h1>
            <p className="subtitle">
                Live two-way synchronization demo
            </p>

            {/* STATUS */}
            <div className="card">
                <h2>System Status</h2>

                <button onClick={fetchStatus}>Check Status</button>

                {status && (
                    <div className="status-row">
            <span className={status.mysql ? "badge green" : "badge red"}>
              MySQL {status.mysql ? "Connected" : "Disconnected"}
            </span>
                        <span
                            className={
                                status.googleSheets ? "badge green" : "badge red"
                            }
                        >
              Google Sheets{" "}
                            {status.googleSheets ? "Connected" : "Disconnected"}
            </span>
                    </div>
                )}
            </div>

            {/* ACTIONS */}
            <div className="card">
                <h2>Actions</h2>

                <div className="action-row">
                    <button onClick={manualSync}>Sync Now</button>

                    <a
                        href={GOOGLE_SHEET_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="link-btn"
                    >
                        Open Google Sheet ↗
                    </a>
                </div>
            </div>

            {/* MYSQL DATA */}
            <div className="card">
                <h2>MySQL Data (Source of Truth)</h2>

                <button onClick={fetchMysqlRows}>
                    Show Latest 10 Rows
                </button>

                <pre className="code">
          {JSON.stringify(mysqlRows, null, 2)}
        </pre>
            </div>

            {/* GOOGLE SHEETS DATA */}
            <div className="card">
                <h2>Google Sheets Data (Synced View)</h2>

                <button onClick={fetchSheetRows}>
                    Show Latest 10 Rows from Sheet
                </button>

                {sheetData && (
                    <pre className="code">
            {JSON.stringify(sheetData, null, 2)}
          </pre>
                )}
            </div>
        </div>
    );
}

export default App;
