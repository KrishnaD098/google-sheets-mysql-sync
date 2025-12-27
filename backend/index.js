require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const db = require("./db");
const sync = require("./sync"); // Sheets → MySQL
const mysqlToSheetsSync = require("./mysqlToSheets"); // MySQL → Sheets
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
            await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
            googleSheets = true;
        } catch {}
    }

    res.json({ mysql, googleSheets });
});

/**
 * Latest MySQL rows
 */
app.get("/rows/latest", async (req, res) => {
    const [rows] = await db
        .promise()
        .query("SELECT * FROM sheet_rows ORDER BY id ASC");

    res.json(rows.slice(-10));
});

/**
 * Latest Google Sheets rows
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
 * Sheets → MySQL (manual)
 */
app.post("/sync-now", async (req, res) => {
    try {
        await sync();
        res.json({ status: "Sheets synced to MySQL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * MySQL → Sheets (manual)
 */
app.post("/sync-mysql-to-sheets", async (req, res) => {
    try {
        await mysqlToSheetsSync();
        res.json({ status: "MySQL synced to Google Sheets" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 🔁 FULL TWO-WAY SYNC (Sheets → MySQL → Sheets)
 */
app.post("/sync-both", async (req, res) => {
    try {
        // 1️⃣ Google Sheets → MySQL
        await sync();

        // 2️⃣ MySQL → Google Sheets
        await mysqlToSheetsSync();

        res.json({ status: "Two-way sync completed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Auto Sheets → MySQL (every 10s)
 */
// cron.schedule("*/10 * * * * *", async () => {
//     try {
//         await sync();
//         console.log("⏱️ Auto sync: Sheets → MySQL");
//     } catch (err) {
//         console.error(err.message);
//     }
// });
//
// /**
//  * Auto MySQL → Sheets (every 20s)
//  * 🔥 THIS FIXES YOUR PRODUCTION ISSUE
//  */
// cron.schedule("*/20 * * * * *", async () => {
//     try {
//         await mysqlToSheetsSync();
//         console.log("⏱️ Auto sync: MySQL → Sheets");
//     } catch (err) {
//         console.error(err.message);
//     }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Backend running on port ${PORT}`)
);
