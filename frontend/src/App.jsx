import { useState } from "react";

const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:5000";

function App() {
    const [mysqlRows, setMysqlRows] = useState([]);
    const [sheetRows, setSheetRows] = useState([]);

    const loadMySQL = async () => {
        const res = await fetch(`${API_BASE}/rows/latest`);
        setMysqlRows(await res.json());
    };

    const loadSheets = async () => {
        const res = await fetch(`${API_BASE}/sheets/latest`);
        setSheetRows(await res.json());
    };

    return (
        <div>
            <h1>MySQL ↔ Google Sheets Sync Dashboard</h1>

            <button onClick={() => fetch(`${API_BASE}/sync-now`, { method: "POST" })}>
                Sync Sheets → MySQL
            </button>

            <button
                onClick={() =>
                    fetch(`${API_BASE}/sync-mysql-to-sheets`, { method: "POST" })
                }
            >
                Sync MySQL → Sheets
            </button>

            <button onClick={loadMySQL}>Show MySQL</button>
            <button onClick={loadSheets}>Show Sheets</button>

            <pre>{JSON.stringify(mysqlRows, null, 2)}</pre>
            <pre>{JSON.stringify(sheetRows, null, 2)}</pre>
        </div>
    );
}

export default App;
