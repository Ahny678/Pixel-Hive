// src/pdf/pdf-example-data.ts

export const pdfTextExample = `
\`\`\`
Report Title: Q3 Financial Summary

This document provides an overview of the financial performance for the third quarter.
Key highlights include:
- Revenue growth of 12% compared to Q2.
- Customer satisfaction improved by 8%.
- Operational costs decreased by 5%.

Generated on: 2025-10-27
Prepared by: Finance Department
\`\`\`
`;

export const pdfHtmlExample = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Monthly Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
    p { line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
    th { background-color: #f4f6f8; }
    .footer { margin-top: 40px; font-size: 0.9em; color: #777; text-align: center; }
  </style>
</head>
<body>
  <h1>Monthly Sales Report</h1>
  <p>This report summarizes the sales performance for the month of September 2025. Below is a breakdown of key figures by region.</p>
  <table>
    <thead>
      <tr>
        <th>Region</th>
        <th>Total Sales</th>
        <th>Growth</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>North America</td>
        <td>$120,000</td>
        <td>+10%</td>
      </tr>
      <tr>
        <td>Europe</td>
        <td>$95,000</td>
        <td>+8%</td>
      </tr>
      <tr>
        <td>Asia-Pacific</td>
        <td>$75,000</td>
        <td>+12%</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    Generated on October 27, 2025 | Confidential
  </div>
</body>
</html>
\`\`\`
`;
