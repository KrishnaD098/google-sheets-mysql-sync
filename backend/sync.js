const db = require("./db");
const { sheets, SHEET_ID } = require("./sheets");

async function syncSheetToMySQL() {
    if (!sheets || !SHEET_ID) return;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Sheet1",
        });

        const values = response.data.values || [];
        if (values.length <= 1) return;

        const headers = values[0];
        const sheetRows = values.slice(1);

        const sheetIds = new Set();

        // ---------- UPSERT ----------
        for (const row of sheetRows) {
            const rowObj = {};
            headers.forEach((h, i) => {
                rowObj[h] = row[i] ?? "";
            });

            const id = Number(rowObj.id);
            if (!id) continue;

            sheetIds.add(id);
            delete rowObj.id;

            await db.promise().query(
                `
                    INSERT INTO sheet_rows (id, data)
                    VALUES (?, ?)
                        ON DUPLICATE KEY UPDATE data = VALUES(data)
                `,
                [id, JSON.stringify(rowObj)]
            );
        }

        // ---------- DELETE MISSING ----------
        const [dbRows] = await db
            .promise()
            .query("SELECT id FROM sheet_rows");

        for (const r of dbRows) {
            if (!sheetIds.has(r.id)) {
                await db
                    .promise()
                    .query("DELETE FROM sheet_rows WHERE id = ?", [r.id]);
            }
        }

        console.log("✅ Google Sheets → MySQL reconciliation complete");
    } catch (err) {
        console.error("❌ Sync error:", err.message);
    }
}

module.exports = syncSheetToMySQL;
