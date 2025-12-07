export const pdfTextExample = `
Report Title: Q3 Financial Summary

This document provides an overview of the financial performance for the third quarter.
Key highlights include:
- Revenue growth of 12% compared to Q2.
- Customer satisfaction improved by 8%.
- Operational costs decreased by 5%.

Generated on: 2025-10-27
Prepared by: Finance Department
`;

// export const pdfHtmlExample = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <title>Monthly Report</title>
//   <style>
//     body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
//     h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
//     p { line-height: 1.6; }
//     table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//     th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
//     th { background-color: #f4f6f8; }
//     .footer { margin-top: 40px; font-size: 0.9em; color: #777; text-align: center; }
//   </style>
// </head>
// <body>
//   <h1>Monthly Sales Report</h1>
//   <p>This report summarizes the sales performance for the month of September 2025. Below is a breakdown of key figures by region.</p>
//   <table>
//     <thead>
//       <tr>
//         <th>Region</th>
//         <th>Total Sales</th>
//         <th>Growth</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr>
//         <td>North America</td>
//         <td>$120,000</td>
//         <td>+10%</td>
//       </tr>
//       <tr>
//         <td>Europe</td>
//         <td>$95,000</td>
//         <td>+8%</td>
//       </tr>
//       <tr>
//         <td>Asia-Pacific</td>
//         <td>$75,000</td>
//         <td>+12%</td>
//       </tr>
//     </tbody>
//   </table>
//   <div class="footer">
//     Generated on October 27, 2025 | Confidential
//   </div>
// </body>
// </html>
// `;

export const pdfHtmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #222;
      font-size: 14px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }

    .company-details h1 {
      margin: 0;
      font-size: 28px;
      color: #2c3e50;
    }

    .company-details p {
      margin: 2px 0;
    }

    .invoice-info {
      margin-top: 30px;
    }

    .invoice-info table {
      width: 100%;
      border-collapse: collapse;
    }

    .invoice-info th {
      text-align: left;
      font-weight: bold;
      padding: 4px 0;
    }

    .invoice-meta {
      margin-top: 20px;
      border: 1px solid #ccc;
      padding: 15px;
      border-radius: 4px;
      width: 320px;
    }

    .invoice-meta table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .invoice-meta th {
      text-align: left;
      padding: 3px 0;
      color: #2c3e50;
    }

    .invoice-meta td {
      text-align: right;
      padding: 3px 0;
    }

    .section-title {
      margin-top: 40px;
      font-size: 18px;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 6px;
    }

    table.items {
      width: 100%;
      margin-top: 15px;
      border-collapse: collapse;
    }

    table.items th {
      background: #f4f6f8;
      border: 1px solid #ccc;
      padding: 10px;
      font-weight: bold;
      text-align: left;
    }

    table.items td {
      border: 1px solid #ccc;
      padding: 10px;
      vertical-align: top;
    }

    .totals {
      margin-top: 30px;
      width: 300px;
      margin-left: auto;
    }

    .totals table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .totals th {
      text-align: left;
      padding: 6px 0;
    }

    .totals td {
      text-align: right;
      padding: 6px 0;
    }

    .notes {
      margin-top: 40px;
      font-size: 13px;
      line-height: 1.6;
      color: #555;
    }

    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 11px;
      color: #777;
      border-top: 1px solid #ccc;
      padding-top: 15px;
    }
  </style>
</head>

<body>

  <div class="header">
    <div class="company-details">
      <h1>Your Company Name</h1>
      <p>123 Business Road</p>
      <p>City, State ZIP</p>
      <p>Email: info@company.com</p>
      <p>Phone: (000) 000-0000</p>
    </div>

    <div class="invoice-meta">
      <table>
        <tr>
          <th>Invoice #:</th>
          <td>INV-0001</td>
        </tr>
        <tr>
          <th>Issue Date:</th>
          <td>2025-01-01</td>
        </tr>
        <tr>
          <th>Due Date:</th>
          <td>2025-01-15</td>
        </tr>
        <tr>
          <th>Status:</th>
          <td>Unpaid</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="invoice-info">
    <h2 class="section-title">Bill To</h2>
    <table>
      <tr>
        <th>Client Name:</th>
        <td>Client Company Inc.</td>
      </tr>
      <tr>
        <th>Address:</th>
        <td>456 Client Street, City, State ZIP</td>
      </tr>
      <tr>
        <th>Email:</th>
        <td>client@example.com</td>
      </tr>
      <tr>
        <th>Phone:</th>
        <td>(111) 111-1111</td>
      </tr>
    </table>
  </div>

  <h2 class="section-title">Invoice Items</h2>
  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Line Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Professional Consulting Services – January</td>
        <td>10</td>
        <td>$150.00</td>
        <td>$1,500.00</td>
      </tr>
      <tr>
        <td>Custom Software Development</td>
        <td>20</td>
        <td>$120.00</td>
        <td>$2,400.00</td>
      </tr>
      <tr>
        <td>Project Management & Coordination</td>
        <td>5</td>
        <td>$100.00</td>
        <td>$500.00</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <th>Subtotal:</th>
        <td>$4,400.00</td>
      </tr>
      <tr>
        <th>Tax (10%):</th>
        <td>$440.00</td>
      </tr>
      <tr>
        <th>Total:</th>
        <td><strong>$4,840.00</strong></td>
      </tr>
      <tr>
        <th>Amount Due:</th>
        <td><strong>$4,840.00</strong></td>
      </tr>
    </table>
  </div>

  <div class="notes">
    <strong>Notes:</strong><br />
    Thank you for your business. Payments can be made via bank transfer, card, or approved methods listed in your service agreement.<br />
    Please include the invoice number with all payments to ensure proper credit.
  </div>

  <div class="footer">
    This invoice was generated electronically and is valid without a signature.
  </div>

</body>
</html>
`;
