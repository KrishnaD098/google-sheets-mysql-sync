const { google } = require("googleapis");

let sheets = null;

if (process.env.GOOGLE_CREDENTIALS && process.env.SHEET_ID) {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    sheets = google.sheets({ version: "v4", auth });
    console.log("Google Sheets API enabled");
} else {
    console.warn("Google Sheets API disabled (env vars not set)");
}

module.exports = {
    sheets,
    SHEET_ID: process.env.SHEET_ID
};
