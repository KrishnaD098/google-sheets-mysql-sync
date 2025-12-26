require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const db = require("./db");
const sync = require("./sync");
const { sheets, SHEET_ID } = require("./sheets");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/**
 * System status
 */
app.get("/status", async (req, res) => {
    let mysql = false;
    let googleSheets = false;

    try {
        await db.promise().query("SELECT 1");
        mysql = true;
    } catch {}

    if (sheets && SHEET_ID) {
        try {
            await sheets.spreadsheets.get({
                spreadsheetId: SHEET_ID,
            });
            googleSheets = true;
        } catch {}
    }

    res.json({ mysql, googleSheets });
});

/**
 * Latest MySQL rows (preview)
 */
app.get("/rows/latest", async (req, res) => {
    const [rows] = await db
        .promise()
        .query("SELECT * FROM sheet_rows ORDER BY id ASC");
    res.json(rows.slice(-10));
});

/**
 * Latest Google Sheets rows (preview)
 */
app.get("/sheets/latest", async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Sheet1",
    });

    const values = response.data.values || [];
    const header = values[0] || [];
    const rows = values.slice(1).slice(-10);

    res.json({ header, rows });
});

/**
 * 🔥 MANUAL SYNC ENDPOINT (THIS FIXES 404)
 */
app.post("/sync-now", async (req, res) => {
    try {
        await sync();
        res.json({ status: "Synced successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Auto sync every 10 seconds (demo-friendly)
 */
cron.schedule("*/10 * * * * *", async () => {
    console.log("⏱️ Auto sync triggered");
    await sync();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Backend running on port 5000");
});
