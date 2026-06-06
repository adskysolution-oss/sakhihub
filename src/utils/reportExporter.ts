import { Buffer } from 'buffer';

export function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function exportToCsv(data: any[], selectedFields: string[]): string {
  if (!data || data.length === 0) return '';
  
  // Header Row
  const headers = selectedFields.map(f => {
    const label = f.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    return `"${label.replace(/"/g, '""')}"`;
  }).join(',');
  
  // Data Rows
  const rows = data.map(row => {
    return selectedFields.map(field => {
      let val: any = '';
      if (field.includes('.')) {
        const parts = field.split('.');
        let nested = row;
        for (const part of parts) {
          nested = nested ? nested[part] : '';
        }
        val = nested;
      } else {
        val = row[field];
      }
      
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      
      // Escape double quotes
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
}

export function exportToExcel(data: any[], selectedFields: string[], entityType: string, filters: any): string {
  const sheetName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  
  // Render Filters as a Metadata Section at the top
  const filterRows: string[] = [];
  filterRows.push(`
    <Row>
      <Cell ss:MergeAcross="${selectedFields.length - 1}" ss:StyleID="HeaderTitle">
        <Data ss:Type="String">SakhiHub Network Intelligence Center - ${sheetName} Report</Data>
      </Cell>
    </Row>
  `);
  filterRows.push(`
    <Row>
      <Cell ss:MergeAcross="${selectedFields.length - 1}" ss:StyleID="SubHeader">
        <Data ss:Type="String">Generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}</Data>
      </Cell>
    </Row>
  `);
  
  if (filters) {
    let filterString = `Filters: Date Range: ${filters.startDate ? new Date(filters.startDate).toLocaleDateString() : 'All'} to ${filters.endDate ? new Date(filters.endDate).toLocaleDateString() : 'All'}`;
    if (filters.status && filters.status.length > 0) filterString += ` | Status: ${filters.status.join(', ')}`;
    if (filters.paymentStatus && filters.paymentStatus.length > 0) filterString += ` | Payments: ${filters.paymentStatus.join(', ')}`;
    if (filters.location) {
      const loc = filters.location;
      if (loc.state || loc.district || loc.block) {
        filterString += ` | Location: ${[loc.state, loc.district, loc.block].filter(Boolean).join(' -> ')}`;
      }
    }
    filterRows.push(`
      <Row>
        <Cell ss:MergeAcross="${selectedFields.length - 1}" ss:StyleID="FilterMeta">
          <Data ss:Type="String">${escapeXml(filterString)}</Data>
        </Cell>
      </Row>
    `);
  }
  
  // Space row
  filterRows.push('<Row><Cell><Data ss:Type="String"></Data></Cell></Row>');

  // Columns Width Definitions
  const colWidths = selectedFields.map(() => '<Column ss:Width="120"/>').join('\n');

  // Headers
  const headerCells = selectedFields.map(f => {
    const label = f.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    return `<Cell ss:StyleID="TableHeader"><Data ss:Type="String">${escapeXml(label)}</Data></Cell>`;
  }).join('');
  const headerRow = `<Row ss:Height="22">${headerCells}</Row>`;

  // Data
  const dataRows = data.map(row => {
    const cells = selectedFields.map(field => {
      let val: any = '';
      if (field.includes('.')) {
        const parts = field.split('.');
        let nested = row;
        for (const part of parts) {
          nested = nested ? nested[part] : '';
        }
        val = nested;
      } else {
        val = row[field];
      }
      
      if (val === null || val === undefined) {
        return '<Cell ss:StyleID="DataCell"><Data ss:Type="String"></Data></Cell>';
      }
      
      const isNum = typeof val === 'number';
      const type = isNum ? 'Number' : 'String';
      const cellVal = isNum ? val : escapeXml(String(val));
      return `<Cell ss:StyleID="DataCell"><Data ss:Type="${type}">${cellVal}</Data></Cell>`;
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>SakhiHub Intelligence Center</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="HeaderTitle">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="14" ss:Color="#1e293b" ss:Bold="1"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#64748b" ss:Italic="1"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="FilterMeta">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#334155"/>
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="TableHeader">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#ffffff" ss:Bold="1"/>
      <Interior ss:Color="#0f172a" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#ffffff"/>
      </Borders>
    </Style>
    <Style ss:ID="DataCell">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#334155"/>
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="${sheetName}">
    <Table>
      ${colWidths}
      ${filterRows.join('\n')}
      ${headerRow}
      ${dataRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <Selected/>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  return xml;
}

export function getStyledHtmlReport(htmlContent: string, title: string, reportId: string): string {
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      body {
        font-family: 'Inter', sans-serif;
        color: #1e293b;
        background-color: #ffffff;
        margin: 0;
        padding: 30px;
        font-size: 11px;
        line-height: 1.5;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 20px;
        margin-bottom: 25px;
      }
      
      .brand {
        display: flex;
        flex-direction: column;
      }
      
      .brand-name {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.025em;
      }
      
      .brand-sub {
        font-size: 9px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 2px;
      }
      
      .meta-box {
        text-align: right;
      }
      
      .meta-title {
        font-size: 12px;
        font-weight: 700;
        color: #6d28d9;
        text-transform: uppercase;
      }
      
      .meta-row {
        font-size: 9px;
        color: #64748b;
        margin-top: 3px;
        font-weight: 500;
      }
      
      .report-id {
        font-family: monospace;
        font-weight: bold;
        color: #0f172a;
        background-color: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 25px;
      }
      
      .info-block {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 15px;
      }
      
      .info-block h3 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 11px;
        font-weight: 800;
        color: #0f172a;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
      }
      
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      
      .info-row:last-child {
        margin-bottom: 0;
      }
      
      .info-row .label {
        color: #64748b;
        font-weight: 500;
      }
      
      .info-row .value {
        color: #0f172a;
        font-weight: 700;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }
      
      .stat-card {
        background: #faf5ff;
        border: 1px solid #f3e8ff;
        border-radius: 12px;
        padding: 12px;
        text-align: center;
      }
      
      .stat-card .value {
        font-size: 16px;
        font-weight: 800;
        color: #6d28d9;
      }
      
      .stat-card .label {
        font-size: 8px;
        font-weight: 700;
        color: #7c3aed;
        text-transform: uppercase;
        margin-top: 4px;
        letter-spacing: 0.025em;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
      }
      
      .data-table th {
        background-color: #0f172a;
        color: #ffffff;
        text-align: left;
        padding: 8px 10px;
        font-weight: 600;
        font-size: 9px;
        text-transform: uppercase;
        border: 1px solid #0f172a;
      }
      
      .data-table td {
        padding: 8px 10px;
        border-bottom: 1px solid #e2e8f0;
        border-left: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        color: #334155;
      }
      
      .data-table tr:nth-child(even) td {
        background-color: #f8fafc;
      }
      
      .data-table th:first-child,
      .data-table td:first-child {
        text-align: center;
        width: 40px;
      }
      
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        border-top: 1px solid #f1f5f9;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        font-size: 8px;
        color: #94a3b8;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="brand">
        <span class="brand-name">SakhiHub</span>
        <span class="brand-sub">Network Intelligence Center</span>
      </div>
      <div class="meta-box">
        <div class="meta-title">${escapeXml(title)}</div>
        <div class="meta-row">Report ID: <span class="report-id">${escapeXml(reportId)}</span></div>
        <div class="meta-row">Generated: ${escapeXml(formattedDate)}</div>
      </div>
    </div>
    
    <div class="content">
      ${htmlContent}
    </div>
    
    <div class="footer">
      <span>Confidential - For Internal Use Only</span>
      <span>Powered by SakhiHub Intelligence Engine</span>
    </div>
  </body>
  </html>
  `;
}