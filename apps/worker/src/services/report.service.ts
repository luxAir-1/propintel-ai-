export function generateReportHTML(data: {
  listing: any;
  score: any;
  financials: any;
}) {
  const { listing, score, financials } = data;

  const scoreColor =
    (score?.score || 0) >= 80
      ? '#10b981'
      : (score?.score || 0) >= 65
        ? '#06b6d4'
        : (score?.score || 0) >= 50
          ? '#f59e0b'
          : '#ef4444';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 40px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .score-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: ${scoreColor};
      color: white;
      font-size: 48px;
      font-weight: bold;
      margin: 20px 0;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      border-left: 4px solid #06b6d4;
      background: #f9fafb;
      border-radius: 4px;
    }
    .section h2 {
      color: #0f172a;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 15px 0;
    }
    .metric {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .metric-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      color: #0f172a;
      font-size: 24px;
      font-weight: bold;
    }
    .metric-sublabel {
      color: #9ca3af;
      font-size: 12px;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
    .strength { color: #059669; }
    .weakness { color: #dc2626; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PropIntel Investment Report</h1>
    <p>Real Estate Deal Analysis</p>
  </div>

  <div class="section">
    <h2>Property Overview</h2>
    <h3 style="color: #374151; margin: 10px 0;">${listing.address}</h3>
    <p style="color: #6b7280;">${listing.city}, ${listing.state} ${listing.zipCode}</p>

    <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="metric">
        <div class="metric-label">Price</div>
        <div class="metric-value">$${(listing.price / 1000000).toFixed(2)}M</div>
      </div>
      <div class="metric">
        <div class="metric-label">Beds</div>
        <div class="metric-value">${listing.beds}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Baths</div>
        <div class="metric-value">${listing.baths}</div>
      </div>
      <div class="metric">
        <div class="metric-label">SqFt</div>
        <div class="metric-value">${(listing.sqft / 1000).toFixed(1)}K</div>
      </div>
    </div>
  </div>

  ${
    score
      ? `
  <div class="section">
    <h2>Deal Score</h2>
    <div style="display: flex; align-items: center; gap: 30px;">
      <div class="score-badge">${score.score}</div>
      <div>
        <h3 style="color: #0f172a; margin-bottom: 10px;">AI Analysis</h3>
        <p style="color: #374151; margin-bottom: 15px;">${score.summary}</p>
        ${
          score.strengths?.length
            ? `
        <h4 style="color: #059669; margin-top: 10px; margin-bottom: 5px;">✓ Strengths</h4>
        <ul style="margin-left: 20px; color: #059669;">
          ${score.strengths.map((s: string) => `<li>${s}</li>`).join('')}
        </ul>
        `
            : ''
        }
        ${
          score.weaknesses?.length
            ? `
        <h4 style="color: #dc2626; margin-top: 10px; margin-bottom: 5px;">✗ Weaknesses</h4>
        <ul style="margin-left: 20px; color: #dc2626;">
          ${score.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
        </ul>
        `
            : ''
        }
      </div>
    </div>
  </div>
  `
      : ''
  }

  ${
    financials
      ? `
  <div class="section">
    <h2>Financial Analysis</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Purchase Price</td>
        <td>$${financials.purchasePrice?.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Down Payment</td>
        <td>$${(financials.purchasePrice * financials.downPaymentPercent / 100)?.toLocaleString()} (${financials.downPaymentPercent}%)</td>
      </tr>
      <tr>
        <td>Loan Amount</td>
        <td>$${financials.loanAmount?.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Monthly Payment</td>
        <td>$${financials.monthlyPayment?.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Monthly Rental Income</td>
        <td>$${financials.rentalIncome?.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Monthly Expenses</td>
        <td>$${financials.monthlyExpenses?.toLocaleString()}</td>
      </tr>
      <tr style="background: #f0fdf4; font-weight: bold;">
        <td>Monthly Cash Flow</td>
        <td style="color: #059669;">$${financials.cashFlow?.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Cap Rate</td>
        <td>${financials.capRate?.toFixed(2)}%</td>
      </tr>
      <tr style="background: #eff6ff; font-weight: bold;">
        <td>Projected ROI</td>
        <td style="color: #0284c7;">${financials.roiPercent?.toFixed(2)}%</td>
      </tr>
    </table>

    ${
      financials.projections
        ? `
    <h3 style="margin-top: 20px; color: #0f172a;">5-Year Profit Projection</h3>
    <table>
      <tr>
        <th>Year</th>
        <th>Annual Profit</th>
      </tr>
      <tr><td>Year 1</td><td>$${financials.projections.year1?.toLocaleString()}</td></tr>
      <tr><td>Year 2</td><td>$${financials.projections.year2?.toLocaleString()}</td></tr>
      <tr><td>Year 3</td><td>$${financials.projections.year3?.toLocaleString()}</td></tr>
      <tr><td>Year 4</td><td>$${financials.projections.year4?.toLocaleString()}</td></tr>
      <tr><td>Year 5</td><td>$${financials.projections.year5?.toLocaleString()}</td></tr>
    </table>
    `
        : ''
    }
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>Generated by PropIntel AI on ${new Date().toLocaleDateString()}</p>
    <p>This report is for informational purposes only and should not be considered investment advice.</p>
  </div>
</body>
</html>
  `;
}
