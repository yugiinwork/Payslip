import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, RotateCcw } from 'lucide-react';

const DEFAULT_SUMMARY_ROWS = [
  { id: 'employeeName', label: 'Employee Name', valueKey: 'employeeName' },
  { id: 'employeeNo', label: 'Employee ID', valueKey: 'employeeNo' },
  { id: 'designation', label: 'Designation', valueKey: 'designation' },
  { id: 'bankAccountNo', label: 'Bank Account No', valueKey: 'bankAccountNo' },
  { id: 'dateOfJoining', label: 'Date of Joining', valueKey: 'dateOfJoining' },
  { id: 'payPeriod', label: 'Pay Period', valueKey: 'payPeriod' },
  { id: 'finalSettlementDate', label: 'Final Settlement Date', valueKey: 'finalSettlementDate' },
  { id: 'uan', label: 'UAN', valueKey: 'uan' },
];
const DEFAULT_EARNINGS = [
  { id: 1, name: 'Basic', amount: '' },
  { id: 2, name: 'House Rent Allowance', amount: '' },
  { id: 3, name: 'Conveyance Allowance', amount: '' },
  { id: 4, name: 'Bonus', amount: '' },
  { id: 5, name: 'Commission', amount: '' },
  { id: 6, name: 'Fixed Allowance', amount: '' },
  { id: 7, name: 'Leave Encashment', amount: '' },
];
const DEFAULT_DEDUCTIONS = [
  { id: 1, name: 'PF', amount: '' },
  { id: 2, name: 'Professional Tax', amount: '' },
  { id: 3, name: 'Other Deductions', amount: '' },
];

const defaultFFSState = {
  employeeName: '',
  employeeNo: '',
  designation: '',
  bankAccountNo: '',
  dateOfJoining: '',
  pfAccountNumber: '',
  payPeriod: '',
  uan: '',
  finalSettlementDate: '',
  paidDays: '',
  esiNumber: '',
  lopDays: '',
  companyName: '',
  earnings: DEFAULT_EARNINGS,
  deductions: DEFAULT_DEDUCTIONS,
  reimbursements: '',
  note: '',
  preparedBy: '',
  checkedBy: '',
  authorisedBy: '',
  declaration: 'I, the undersigned, hereby state that I have received the above said amount as my full and final settlement out of my own free will and choice on tendering my resignation and I assure that I have no grievances, disputes, demands and claims about my legal dues, back wages, reinstatement or reemployment against the company.',
  summaryRows: DEFAULT_SUMMARY_ROWS,
};

export default function FFSFormPane({ ffsData, onFfsChange }) {
  const data = ffsData || defaultFFSState;
  const summaryRows = data.summaryRows || DEFAULT_SUMMARY_ROWS;
  const dragRef = React.useRef(null);

  const moveRow = (listName, from, to) => {
    const rows = [...data[listName]];
    if (to < 0 || to >= rows.length) return;
    const [row] = rows.splice(from, 1);
    rows.splice(to, 0, row);
    onFfsChange({ ...data, [listName]: rows });
  };
  const dragProps = (listName, index) => ({
    draggable: true,
    onDragStart: (event) => { dragRef.current = { listName, index }; event.dataTransfer.effectAllowed = 'move'; },
    onDragOver: (event) => event.preventDefault(),
    onDrop: (event) => { event.preventDefault(); const drag = dragRef.current; if (drag?.listName === listName) moveRow(listName, drag.index, index); dragRef.current = null; },
    onDragEnd: () => { dragRef.current = null; },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFfsChange({ ...data, [name]: value });
  };

  const handleEarningChange = (id, field, value) => {
    onFfsChange({
      ...data,
      earnings: data.earnings.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    });
  };

  const addEarning = () => {
    onFfsChange({
      ...data,
      earnings: [...data.earnings, { id: Date.now(), name: '', amount: '' }],
    });
  };

  const removeEarning = (id) => {
    onFfsChange({ ...data, earnings: data.earnings.filter((r) => r.id !== id) });
  };

  const handleDeductionChange = (id, field, value) => {
    onFfsChange({
      ...data,
      deductions: data.deductions.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    });
  };

  const addDeduction = () => {
    onFfsChange({
      ...data,
      deductions: [...data.deductions, { id: Date.now(), name: '', amount: '' }],
    });
  };

  const removeDeduction = (id) => {
    onFfsChange({ ...data, deductions: data.deductions.filter((r) => r.id !== id) });
  };

  const updateSummaryRows = (summaryRows) => onFfsChange({ ...data, summaryRows });
  const restoreRows = (key, defaults) => {
    const currentRows = data[key];
    const defaultIds = new Set(defaults.map((row) => row.id));
    const restored = defaults.map((row) => ({ ...row, ...(currentRows.find((current) => current.id === row.id) || {}) }));
    onFfsChange({ ...data, [key]: [...restored, ...currentRows.filter((row) => !defaultIds.has(row.id))] });
  };

  return (
    <div className="form-pane" style={{ overflowY: 'auto', padding: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
        Full &amp; Final Settlement
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Fill in the details for the Full and Final Settlement document.
      </p>

      {/* Company */}
      <div className="form-section">
        <h3 className="form-section-title">Company</h3>
        <div className="input-group">
          <label>Company Name</label>
          <input type="text" name="companyName" value={data.companyName || 'Kevins Consulting Engineering Services Pvt Ltd'} onChange={handleChange} placeholder="Kevins Consulting Engineering Services Pvt Ltd" />
        </div>
      </div>

      {/* Employee Details */}
      <div className="form-section">
        <h3 className="form-section-title">Employee Details</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Employee Name</label>
            <input type="text" name="employeeName" value={data.employeeName} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Employee ID</label>
            <input type="text" name="employeeNo" value={data.employeeNo} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Designation</label>
            <input type="text" name="designation" value={data.designation} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Bank Account No</label>
            <input type="text" name="bankAccountNo" value={data.bankAccountNo} onChange={handleChange} />
          </div>
        </div>
        <div className="input-group"><label>Date of Joining</label><input type="date" name="dateOfJoining" value={data.dateOfJoining} onChange={handleChange} /></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Pay Period</label>
            <input type="month" name="payPeriod" value={data.payPeriod} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>UAN</label>
            <input type="text" name="uan" value={data.uan} onChange={handleChange} />
          </div>
        </div>
        <div className="input-group"><label>Final Settlement Date</label><input type="date" name="finalSettlementDate" value={data.finalSettlementDate} onChange={handleChange} /></div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Employee Pay Summary</h3>
        {summaryRows.map((row, index) => <div key={row.id} className="draggable-editor-row" {...dragProps('summaryRows', index)}>
          <div className="drag-handle" title="Drag to rearrange"><GripVertical size={16} /></div>
          <div style={{ display: 'flex', flex: 1, gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <input aria-label="Summary field label" value={row.label} placeholder="Field label" onChange={(e) => updateSummaryRows(summaryRows.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} style={{ flex: 1 }} />
            <select aria-label="Summary field value" value={row.valueKey || ''} onChange={(e) => updateSummaryRows(summaryRows.map((item, i) => i === index ? { ...item, valueKey: e.target.value } : item))} style={{ flex: 1 }}>
              <option value="">Blank value</option>
              {[
                ['employeeName', 'Employee Name'], ['employeeNo', 'Employee ID'], ['designation', 'Designation'],
                ['bankAccountNo', 'Bank Account No'], ['dateOfJoining', 'Date of Joining'], ['payPeriod', 'Pay Period'],
                ['uan', 'UAN'], ['finalSettlementDate', 'Final Settlement Date'],
              ].map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <button type="button" className="btn btn-outline icon-btn" title="Delete row" onClick={() => updateSummaryRows(summaryRows.filter((_, i) => i !== index))}><Trash2 size={14} /></button>
          </div>
        </div>)}
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => updateSummaryRows([...summaryRows, { id: `custom-${Date.now()}`, label: '', valueKey: '' }])}><Plus size={16} /> Add Summary Row</button>
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => restoreRows('summaryRows', DEFAULT_SUMMARY_ROWS)}><RotateCcw size={16} /> Restore Original Order</button>
      </div>

      {/* Earnings */}
      <div className="form-section">
        <h3 className="form-section-title">Earnings</h3>
        {data.earnings.map((row, index) => (
          <div key={row.id} className="draggable-editor-row" {...dragProps('earnings', index)}>
            <div className="drag-handle" title="Drag to rearrange"><GripVertical size={16} /></div>
            <div style={{ display: 'flex', flex: 1, gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="Earning Name" value={row.name} onChange={(e) => handleEarningChange(row.id, 'name', e.target.value)} style={{ flex: 2 }} />
              <input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleEarningChange(row.id, 'amount', e.target.value)} style={{ flex: 1 }} min="0" />
              <button type="button" className="btn btn-outline icon-btn" onClick={() => removeEarning(row.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={addEarning}>
          <Plus size={16} /> Add Earning
        </button>
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={() => restoreRows('earnings', DEFAULT_EARNINGS)}>
          <RotateCcw size={16} /> Restore Original Order
        </button>
      </div>

      {/* Deductions */}
      <div className="form-section">
        <h3 className="form-section-title">Deductions</h3>
        {data.deductions.map((row, index) => (
          <div key={row.id} className="draggable-editor-row" {...dragProps('deductions', index)}>
            <div className="drag-handle" title="Drag to rearrange"><GripVertical size={16} /></div>
            <div style={{ display: 'flex', flex: 1, gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="Deduction Name" value={row.name} onChange={(e) => handleDeductionChange(row.id, 'name', e.target.value)} style={{ flex: 2 }} />
              <input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleDeductionChange(row.id, 'amount', e.target.value)} style={{ flex: 1 }} min="0" />
              <button type="button" className="btn btn-outline icon-btn" onClick={() => removeDeduction(row.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={addDeduction}>
          <Plus size={16} /> Add Deduction
        </button>
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={() => restoreRows('deductions', DEFAULT_DEDUCTIONS)}>
          <RotateCcw size={16} /> Restore Original Order
        </button>
      </div>

      {/* Footer */}
      <div className="form-section">
        <h3 className="form-section-title">Footer &amp; Signatories</h3>
        <div className="input-group">
          <label>Reimbursements (₹)</label>
          <input type="number" name="reimbursements" value={data.reimbursements} onChange={handleChange} placeholder="0" min="0" />
        </div>
        <div className="input-group">
          <label>Note</label>
          <input type="text" name="note" value={data.note} onChange={handleChange} placeholder="Optional note" />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Prepared By</label>
            <input type="text" name="preparedBy" value={data.preparedBy} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Checked By</label>
            <input type="text" name="checkedBy" value={data.checkedBy} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Authorised By</label>
            <input type="text" name="authorisedBy" value={data.authorisedBy} onChange={handleChange} />
          </div>
        </div>
        <div className="input-group">
          <label>Declaration Text</label>
          <textarea name="declaration" value={data.declaration} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
        </div>
      </div>
    </div>
  );
}
