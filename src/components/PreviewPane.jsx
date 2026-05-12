import React from 'react';
import { Printer } from 'lucide-react';

const formatCurrency = (amount, branch) => {
  const currency = branch === 'UAE' ? 'AED ' : '';
  const value = parseFloat(amount) || 0;
  return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMonthYear = (value) => {
  if (!value) {
    return 'Month Year';
  }

  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const numberToWords = (amount) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelowThousand = (num) => {
    let result = '';
    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }
    if (num >= 20) {
      result += `${tens[Math.floor(num / 10)]} `;
      num %= 10;
    } else if (num >= 10) {
      result += `${teens[num - 10]} `;
      num = 0;
    }
    if (num > 0) {
      result += `${ones[num]} `;
    }
    return result.trim();
  };

  const value = Math.round(parseFloat(amount) || 0);
  if (value === 0) {
    return 'Zero Only';
  }

  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const remainder = value % 1000;
  const parts = [];

  if (crore) parts.push(`${convertBelowThousand(crore)} Crore`);
  if (lakh) parts.push(`${convertBelowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${convertBelowThousand(thousand)} Thousand`);
  if (remainder) parts.push(convertBelowThousand(remainder));

  return `${parts.join(' ')} Only`;
};

const detailRowsLeft = (formData) => [
  ['Employee Code', formData.employeeId],
  ['Employee name', formData.employeeName],
  ['Designation', formData.designation],
  ['Location', formData.location],
  ['Branch', formData.branchOffice],
  ['City', formData.city],
  ... (formData.identification || []).slice(0, Math.ceil((formData.identification || []).length / 2)).map(item => [item.name, item.value]),
  ['Date of Joining', formatDate(formData.joiningDate)],
];

const detailRowsRight = (formData) => [
  ['Company', formData.company],
  ['Bank Name', formData.bankName],
  ['Bank Account Number', formData.accountNumber],
  ... (formData.identification || []).slice(Math.ceil((formData.identification || []).length / 2)).map(item => [item.name, item.value]),
  ['Total Working Days', formData.workingDays],
  ['LOP', formData.leavesTaken],
  ['Arrears Days', formData.arrearsDays],
  ['Tax Regime', formData.taxRegime],
];

export default function PreviewPane({ formData, calculations, onPrintPdf, readOnly = false }) {
  const computedDeductionAmounts = new Map(
    calculations.deductions.map((row) => [row.id, row.amount])
  );

  const deductionRows = formData.deductions.map((row) => ({
    ...row,
    amount: computedDeductionAmounts.get(row.id) ?? row.amount,
  }));

  const deductionDisplayRows = deductionRows;

  const salaryRowCount = Math.max(calculations.earnings.length, deductionDisplayRows.length);
  const paddedEarnings = [
    ...calculations.earnings,
    ...Array.from({ length: salaryRowCount - calculations.earnings.length }, (_, index) => ({
      id: `empty-earning-${index}`,
      name: '',
      monthlyRate: '',
      currentMonth: '',
      arrears: '',
      total: '',
      isEmpty: true,
    })),
  ];
  const paddedDeductions = [
    ...deductionDisplayRows,
    ...Array.from({ length: salaryRowCount - deductionDisplayRows.length }, (_, index) => ({
      id: `empty-deduction-${index}`,
      name: '',
      amount: '',
      isEmpty: true,
    })),
  ];

  return (
    <div className="preview-pane">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {!readOnly ? (
          <div className="preview-actions print-hide">
            <button className="btn btn-primary" onClick={onPrintPdf}>
              <Printer size={18} /> Print PDF
            </button>
          </div>
        ) : null}

        <div className="a4-page payslip-page" id="payslip">
          <div className="payslip-frame">
            <div className="payslip-header">
              <div className="company-panel">
                <h1>{formData.companyName || 'COMPANY NAME'}</h1>
                {formData.companySubtitle ? <p className="company-subtitle">{formData.companySubtitle}</p> : null}
                {formData.companyAddress ? <p className="company-address">{formData.companyAddress}</p> : null}
              </div>
            </div>

            <div className="payslip-title">Payslip for the month of {formatMonthYear(formData.monthYear)}</div>

            <div className="details-grid">
              <div className="details-column">
                {detailRowsLeft(formData).map(([label, value]) => (
                  <div className="detail-row" key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value || ''}</span>
                  </div>
                ))}
              </div>
              <div className="details-column">
                {detailRowsRight(formData).map(([label, value]) => (
                  <div className="detail-row" key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="salary-section">
              <div className="earnings-table-wrap">
                <table className="salary-table">
                  <thead>
                    <tr>
                      <th>Earnings</th>
                      <th>Monthly Rate</th>
                      <th>Current Month</th>
                      <th>Arrears</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paddedEarnings.map((row) => (
                      <tr key={row.id} className={row.isEmpty ? 'empty-salary-row' : ''}>
                        <td>{row.name || ''}</td>
                        <td>{formatCurrency(row.monthlyRate, formData.branch)}</td>
                        <td>{formatCurrency(row.currentMonth, formData.branch)}</td>
                        <td>{formatCurrency(row.arrears, formData.branch)}</td>
                        <td>{formatCurrency(row.total, formData.branch)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="deductions-table-wrap">
                <table className="salary-table deductions-table">
                  <thead>
                    <tr>
                      <th>Deductions</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paddedDeductions.map((row) => (
                      <tr
                        key={row.id}
                        className={row.isSectionHeading ? 'salary-subheading-row' : row.isEmpty ? 'empty-salary-row' : ''}
                      >
                        <td>{row.name || ''}</td>
                        <td>{row.isSectionHeading ? row.amount : formatCurrency(row.amount, formData.branch)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="totals-row">
              <div className="totals-cell">
                <span>Total Earnings</span>
                <strong>{formatCurrency(calculations.grossSalary, formData.branch)}</strong>
              </div>
              <div className="totals-cell">
                <span>Total Deductions</span>
                <strong>{formatCurrency(calculations.totalDeductions, formData.branch)}</strong>
              </div>
            </div>

            <div className="footer-row">
              <div className="words-cell">In words ( {formData.branch === 'UAE' ? 'AED' : 'Rs'} ) : {numberToWords(calculations.netSalary)}</div>
              <div className="net-cell">Net Salary : {formatCurrency(calculations.netSalary, formData.branch)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
