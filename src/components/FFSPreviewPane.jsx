import React from 'react';
import { Printer } from 'lucide-react';

/* ── helpers ── */
const fmt = (val) => {
  const n = parseFloat(val) || 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (val) => {
  if (!val) return '';
  const d = new Date(val + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtMonthYear = (val) => {
  if (!val) return '';
  const [year, month] = val.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const numberToWords = (amount) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const below1000 = (n) => {
    let r = '';
    if (n >= 100) { r += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20)  { r += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    else if (n >= 10) { r += ones[n] + ' '; n = 0; }
    if (n > 0) r += ones[n] + ' ';
    return r.trim();
  };

  const v = Math.round(parseFloat(amount) || 0);
  if (v === 0) return 'Zero';
  const cr   = Math.floor(v / 10000000);
  const lk   = Math.floor((v % 10000000) / 100000);
  const th   = Math.floor((v % 100000) / 1000);
  const rem  = v % 1000;
  const parts = [];
  if (cr)  parts.push(below1000(cr)  + ' Crore');
  if (lk)  parts.push(below1000(lk)  + ' Lakh');
  if (th)  parts.push(below1000(th)  + ' Thousand');
  if (rem) parts.push(below1000(rem));
  return parts.join(' ');
};

/* ── shared cell styles ── */
const B = '1px solid #999';   // border

const th = (extra = {}) => ({
  padding: '5px 8px',
  fontWeight: '700',
  fontSize: '11px',
  background: '#e8e8e8',
  borderBottom: B,
  ...extra,
});

const td = (extra = {}) => ({
  padding: '4px 8px',
  fontSize: '11px',
  verticalAlign: 'middle',
  ...extra,
});

/* ══════════════════════════════════════════════════════════ */
export default function FFSPreviewPane({ ffsData, onPrint, readOnly = false }) {
  const d = ffsData || {};
  const earnings   = d.earnings   || [
    { id: 1, name: 'Basic', amount: '' },
    { id: 2, name: 'House Rent Allowance', amount: '' },
    { id: 3, name: 'Conveyance Allowance', amount: '' },
    { id: 4, name: 'Bonus', amount: '' },
    { id: 5, name: 'Commission', amount: '' },
    { id: 6, name: 'Fixed Allowance', amount: '' },
    { id: 7, name: 'Leave Encashment', amount: '' },
  ];
  const deductions = d.deductions || [
    { id: 1, name: 'PF', amount: '' },
    { id: 2, name: 'Professional Tax', amount: '' },
    { id: 3, name: 'Other Deductions', amount: '' },
  ];

  const grossEarnings   = earnings.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalDeductions = deductions.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const reimbursements  = parseFloat(d.reimbursements) || 0;
  const netPayable      = grossEarnings - totalDeductions + reimbursements;

  const maxRows = Math.max(earnings.length, deductions.length);

  /* ─── detail rows ─── */
  const summaryRows = d.summaryRows || [
    { id: 'employeeName', label: 'Employee Name', valueKey: 'employeeName' },
    { id: 'employeeNo', label: 'Employee ID', valueKey: 'employeeNo' },
    { id: 'designation', label: 'Designation', valueKey: 'designation' },
    { id: 'bankAccountNo', label: 'Bank Account No', valueKey: 'bankAccountNo' },
    { id: 'dateOfJoining', label: 'Date of Joining', valueKey: 'dateOfJoining' },
    { id: 'payPeriod', label: 'Pay Period', valueKey: 'payPeriod' },
    { id: 'finalSettlementDate', label: 'Final Settlement Date', valueKey: 'finalSettlementDate' },
    { id: 'uan', label: 'UAN', valueKey: 'uan' },
  ];
  const displayValue = (key) => ({ dateOfJoining: fmtDate(d.dateOfJoining), finalSettlementDate: fmtDate(d.finalSettlementDate), payPeriod: fmtMonthYear(d.payPeriod) }[key] ?? d[key] ?? '');
  const summaryPairs = [];
  for (let i = 0; i < summaryRows.length; i += 2) summaryPairs.push([summaryRows[i], summaryRows[i + 1]]);

  return (
    <div className="preview-pane ffs-preview-pane">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

        {/* Print button */}
        {!readOnly && (
          <div className="preview-actions print-hide">
            <button className="btn btn-primary" onClick={onPrint}>
              <Printer size={18} /> Print PDF
            </button>
          </div>
        )}

        {/* ── A4 page ── */}
        <div className="a4-page" id="ffs-payslip"
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '11px',
            color: '#111',
            background: '#fff',
          }}
        >
          <div style={{ border: '1px solid #aaa', margin: '0', position: 'relative', isolation: 'isolate' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-40deg)',
                color: 'rgba(0, 0, 0, 0.06)',
                fontSize: '32px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: -1,
              }}
            >
              {(d.companyName || 'Kevins Consulting Engineering Services Pvt Ltd').toUpperCase()}
            </div>

            {/* ── Company Name ── */}
            <div style={{ padding: '12px 16px 8px 16px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', lineHeight: 1.2 }}>
                {d.companyName || 'Kevins Consulting Engineering Services Pvt Ltd'}
              </div>
            </div>

            <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #aaa' }} />

            {/* ── FFS Title ── */}
            <div style={{
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '12px',
              padding: '7px 0',
              borderBottom: '1px solid #aaa',
              letterSpacing: '0.5px',
            }}>
              FULL AND FINAL SETTLEMENT
            </div>

            {/* ── EMPLOYEE PAY SUMMARY header ── */}
            <div style={{
              fontWeight: '700',
              fontSize: '11px',
              padding: '5px 8px',
              background: '#f0f0f0',
              borderBottom: '1px solid #aaa',
            }}>
              EMPLOYEE PAY SUMMARY
            </div>

            {/* ── Employee detail rows ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                {summaryPairs.map(([left, right], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={td({ width: '17%', color: '#333' })}>{left?.label || ''}</td>
                    <td style={td({ width: '33%' })}>{left ? `: ${displayValue(left.valueKey)}` : ''}</td>
                    <td style={td({ width: '17%', color: '#333', borderLeft: '1px solid #ddd' })}>{right?.label || ''}</td>
                    <td style={td({ width: '33%' })}>{right ? `: ${displayValue(right.valueKey)}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Earnings & Deductions table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderTop: '1px solid #aaa' }}>
              <thead>
                <tr>
                  <th style={th({ textAlign: 'left', borderRight: B, width: '24%' })}>EARNINGS</th>
                  <th style={th({ textAlign: 'right', borderRight: B, width: '13%' })}>AMOUNT</th>
                  <th style={th({ textAlign: 'left', borderRight: B, width: '24%' })}>DEDUCTIONS</th>
                  <th style={th({ textAlign: 'right', borderRight: B, width: '13%' })}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }, (_, i) => {
                  const e = earnings[i]   || {};
                  const dd = deductions[i] || {};
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={td({ borderRight: B })}>{e.name  || ''}</td>
                      <td style={td({ textAlign: 'right', borderRight: B })}>{e.amount  !== '' && e.amount  != null ? fmt(e.amount)  : ''}</td>
                      <td style={td({ borderRight: B })}>{dd.name || ''}</td>
                      <td style={td({ textAlign: 'right', borderRight: B })}>{dd.amount !== '' && dd.amount != null ? fmt(dd.amount) : ''}</td>
                    </tr>
                  );
                })}

                {/* Gross Earnings / Total Deductions row */}
                <tr style={{ borderTop: B, fontWeight: '700' }}>
                  <td style={td({ borderRight: B, fontWeight: '700' })}>Gross Earnings</td>
                  <td style={td({ textAlign: 'right', borderRight: B, fontWeight: '700' })}>{fmt(grossEarnings)}</td>
                  <td style={td({ borderRight: B, fontWeight: '700' })}>Total Deductions</td>
                  <td style={td({ textAlign: 'right', borderRight: B, fontWeight: '700' })}>{fmt(totalDeductions)}</td>
                </tr>
              </tbody>
            </table>

            {/* ── NET PAY section ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderTop: B }}>
              <thead>
                <tr>
                  <th style={th({ textAlign: 'left', borderRight: B, width: '80%', colSpan: 3 })} colSpan={3}>NET PAY</th>
                  <th style={th({ textAlign: 'right', width: '20%' })}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td colSpan={3} style={td({ borderRight: B })}>Gross Earnings</td>
                  <td style={td({ textAlign: 'right' })}>{fmt(grossEarnings)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td colSpan={3} style={td({ borderRight: B })}>Total Deductions</td>
                  <td style={td({ textAlign: 'right' })}>(-) {fmt(totalDeductions)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td colSpan={3} style={td({ borderRight: B })}>Reimbursements</td>
                  <td style={td({ textAlign: 'right' })}>(+) {fmt(reimbursements)}</td>
                </tr>
                <tr style={{ borderTop: B, fontWeight: '700' }}>
                  <td style={td({ width: '40%' })}></td>
                  <td style={td({ width: '20%' })}></td>
                  <td style={td({ textAlign: 'right', borderRight: B, fontWeight: '700', width: '20%' })}>Total Net Payable</td>
                  <td style={td({ textAlign: 'right', fontWeight: '700', width: '20%' })}>{fmt(netPayable)}</td>
                </tr>
              </tbody>
            </table>

            {/* ── Net Payable in words ── */}
            <div style={{ borderTop: B, padding: '10px 12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                Total Net Payable {fmt(netPayable)}{' '}
                <span style={{ fontWeight: '400', fontSize: '11px' }}>
                  (Indian Rupee {numberToWords(netPayable)} Only)
                </span>
              </div>
              <div style={{ fontSize: '9px', color: '#666', fontStyle: 'italic' }}>
                **Total Net Payable = ((Gross Earnings - Total Deductions) + Reimbursements)
              </div>
            </div>

            {/* ── Note + Signatories + Declaration ── */}
            <div style={{ borderTop: B, padding: '10px 12px' }}>

              {/* Note */}
              <div style={{ marginBottom: '14px', fontSize: '11px' }}>
                <span style={{ fontWeight: '700' }}>Note:</span>{' '}
                {d.note || ''}
              </div>

              {/* Prepared / Checked / Authorised */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '11px' }}>
                <div>Prepared By:{' '}
                  <span style={{ display: 'inline-block', minWidth: '100px', borderBottom: '1px solid #333' }}>
                    {d.preparedBy || ''}
                  </span>
                </div>
                <div>Checked By:{' '}
                  <span style={{ display: 'inline-block', minWidth: '100px', borderBottom: '1px solid #333' }}>
                    {d.checkedBy || ''}
                  </span>
                </div>
                <div>Authorised By:{' '}
                  <span style={{ display: 'inline-block', minWidth: '100px', borderBottom: '1px solid #333' }}>
                    {d.authorisedBy || ''}
                  </span>
                </div>
              </div>

              {/* Declaration */}
              <div style={{ fontSize: '11px' }}>
                <div style={{ fontWeight: '700', marginBottom: '6px' }}>Declaration By the Receiver</div>
                <div style={{ lineHeight: '1.65', color: '#333', marginBottom: '24px' }}>
                  {d.declaration ||
                    'I, the undersigned, hereby state that I have received the above said amount as my full and final settlement out of my own free will and choice on tendering my resignation and I assure that I have no grievances, disputes, demands and claims about my legal dues, back wages, reinstatement or reemployment against the company.'}
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px' }}>
                  Employee&apos;s Signature: ___________________________
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
