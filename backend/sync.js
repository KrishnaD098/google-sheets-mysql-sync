const db = require("./db");
const { sheets, SHEET_ID } = require("./sheets");

module.exports = async function sync() {
    if (!sheets) return;

    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Sheet1"
    });

    const values = result.data.values || [];
    if (values.length < 2) return;

    const headers = values[0];

    for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const id = Number(row[0]);

        if (!id) continue;

        const data = {};
        headers.slice(1).forEach((h, idx) => {
            data[h.trim()] = row[idx + 1] ?? "";
        });

        await db.promise().query(
            `INSERT INTO sheet_rows (id, data)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE data=?`,
            [id, JSON.stringify(data), JSON.stringify(data)]
        );
    }

    console.log("✅ Google Sheets → MySQL sync complete");
};