import {useEffect, useState} from "react";
import "./App.css";
import DataTable from "./DataTable";

const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:5000";

const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1sx6TBw5eksnRQ7ln4l2lZbT9-xSp7nq40xWpCXWPs38";

export default function App() {
    const [status, setStatus] = useState(null);
    const [mysqlRows, setMysqlRows] = useState([]);
    const [sheetData, setSheetData] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncedMessage, setShowSyncedMessage] = useState(false);

    const fetchStatus = async () => {
        const res = await fetch(`${API_BASE}/status`);
        setStatus(await res.json());
    };

    // 🔥 SINGLE SYNC ACTION
    const syncNow = async () => {
        setIsSyncing(true);
        await fetch(`${API_BASE}/sync-both`, {
            method: "POST",
        });

        // refresh data after sync
        fetchMysqlRows();
        fetchSheetRows();
        setIsSyncing(false);
        setShowSyncedMessage(true);
    };

    useEffect(() => {
        if (showSyncedMessage) {
            const timer = setTimeout(() => {
                setShowSyncedMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSyncedMessage]);

    const fetchMysqlRows = async () => {
        const res = await fetch(`${API_BASE}/rows/latest`);
        setMysqlRows(await res.json());
    };

    const fetchSheetRows = async () => {
    const res = await fetch(`${API_BASE}/sheets/latest`);
    const data = await res.json();
    console.log('Sheet data:', data);
    setSheetData(data);
};

    return (
        <div className="container">
            {showSyncedMessage && <div className="synced-message">Synced!</div>}
            <h1>MySQL ↔ Google Sheets Sync Dashboard</h1>
            <p className="subtitle">Live two-way synchronization demo</p>

            {/* STATUS */}
            <div className="card status-card">
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
            <div className="card actions-card">
                <h2>Actions</h2>

                <div className="action-row">
                    <button onClick={syncNow} disabled={isSyncing}>
                        {isSyncing ? "Syncing..." : "Sync Now"}
                    </button>

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
            <div className="card mysql-card">
                <h2>MySQL Data (Source of Truth)</h2>

                <button onClick={fetchMysqlRows}>
                    Show Latest 10 Rows
                </button>

                <DataTable data={mysqlRows} />
            </div>

            {/* GOOGLE SHEETS DATA */}
            <div className="card sheets-card">
                <h2>Google Sheets Data (Synced View)</h2>

                <button onClick={fetchSheetRows}>
                    Show Latest 10 Rows from Sheet
                </button>

                <DataTable data={sheetData} />
            </div>
        </div>
    );
}
