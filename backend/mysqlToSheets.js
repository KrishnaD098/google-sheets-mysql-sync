const db = require("./db");
const { sheets, SHEET_ID } = require("./sheets");

const SHEET_NAME = "Sheet1";

async function mysqlToSheetsSync() {
    // 1️⃣ Fetch rows from MySQL
    const [rows] = await db
        .promise()
        .query("SELECT id, data FROM sheet_rows ORDER BY id ASC");

    if (!rows.length) {
        console.log("No rows found in MySQL to sync");
        return;
    }

    // 2️⃣ Convert MySQL JSON → Sheet rows
    const values = rows.map((row) => {
        const parsed = row.data; // ✅ ALREADY an object
        return [row.id, ...Object.values(parsed)];
    });

    // 3️⃣ Clear existing rows (keep header)
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:Z`,
    });

    // 4️⃣ Push updated rows to Google Sheets
    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2`,
        valueInputOption: "RAW",
        requestBody: { values },
    });

    console.log("⬆️ MySQL → Google Sheets sync completed");
}

module.exports = mysqlToSheetsSync;
