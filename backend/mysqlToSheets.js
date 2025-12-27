const db = require("./db");
const { sheets, SHEET_ID } = require("./sheets");

const SHEET_NAME = "Sheet1";

async function mysqlToSheetsSync() {
    const [rows] = await db
        .promise()
        .query("SELECT id, data FROM sheet_rows ORDER BY id ASC");

    if (!rows.length) return;

    const values = rows.map((row) => {
        const data = JSON.parse(row.data); // Explicitly parse the JSON string
        return [row.id, ...Object.values(data)];
    });

    // clear old rows
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:Z`,
    });

    // write updated rows
    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2`,
        valueInputOption: "RAW",
        requestBody: { values },
    });

    console.log("⬆️ MySQL → Google Sheets synced");
}

module.exports = mysqlToSheetsSync;
