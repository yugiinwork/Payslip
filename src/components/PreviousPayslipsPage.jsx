import React, { useMemo, useState } from 'react';
import PreviewPane from './PreviewPane';
import { calculateSalary } from '../utils/calculations';

export default function PreviousPayslipsPage({
  savedPayslips,
  selectedPayslipRecord,
  onBack,
  onSelectPayslip,
  onDownloadPayslip,
}) {
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const previewData = selectedPayslipRecord?.payload || null;
  const calculations = previewData ? calculateSalary(previewData) : null;
  const employeeOptions = useMemo(
    () => Array.from(new Set(savedPayslips.map((record) => record.employeeName))).sort((a, b) => a.localeCompare(b)),
    [savedPayslips]
  );
  const filteredPayslips = useMemo(
    () =>
      savedPayslips.filter((record) => {
        const matchesEmployee = employeeFilter ? record.employeeName === employeeFilter : true;
        const matchesMonth = monthFilter ? record.monthYear === monthFilter : true;
        return matchesEmployee && matchesMonth;
      }),
    [employeeFilter, monthFilter, savedPayslips]
  );

  return (
    <div className="app-container">
      <div className="form-pane">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>Previous Payslips</h2>
        </div>

        <div className="form-section">
          <button className="btn btn-outline" onClick={onBack} style={{ width: '100%' }}>
            Back To Builder
          </button>
        </div>

        <div className="form-section">
          <div className="input-group">
            <label>Employee Name</label>
            <input
              type="text"
              list="previous-payslip-employee-options"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              placeholder="Search by employee name"
            />
            <datalist id="previous-payslip-employee-options">
              {employeeOptions.map((name, index) => (
                <option key={`${name}-${index}`} value={name} />
              ))}
            </datalist>
          </div>
          <div className="input-group">
            <label>Payslip Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          {filteredPayslips.length === 0 ? (
            <div className="table-row-label">No saved payslips yet.</div>
          ) : null}
          {filteredPayslips.map((record) => (
            <div
              key={record.id}
              className={`history-card ${selectedPayslipRecord?.id === record.id ? 'history-card-active' : ''}`}
            >
              <div>
                <strong>{record.employeeName}</strong>
                <div className="history-meta">
                  {record.monthYear || 'No Month'} | {record.branch === 'India' ? 'Hyderabad' : 'UAE'}
                </div>
              </div>
              <div className="history-actions">
                <button className="btn btn-outline" onClick={() => onSelectPayslip(record)}>Preview</button>
                <button className="btn btn-primary" onClick={() => onDownloadPayslip(record)}>Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-pane">
        {previewData ? (
          <PreviewPane
            formData={previewData}
            calculations={calculations}
            readOnly
          />
        ) : (
          <div className="history-empty-preview">Select a payslip to preview it here.</div>
        )}
      </div>
    </div>
  );
}
