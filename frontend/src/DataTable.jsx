import React from "react";

export default function DataTable({ data }) {
    if (!data || data.length === 0 || !data[0]) {
        return null;
    }

    const headers = Object.keys(data[0]);

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                <tr>
                    {headers.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {headers.map((header) => (
                            <td key={header}>
                                {typeof row[header] === "object" && row[header] !== null
                                    ? JSON.stringify(row[header])
                                    : row[header]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
