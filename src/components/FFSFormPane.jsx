import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
  earnings: [
    { id: 1, name: 'Basic', amount: '', ytd: '' },
    { id: 2, name: 'House Rent Allowance', amount: '', ytd: '' },
    { id: 3, name: 'Conveyance Allowance', amount: '', ytd: '' },
    { id: 4, name: 'Bonus', amount: '', ytd: '' },
    { id: 5, name: 'Commission', amount: '', ytd: '' },
    { id: 6, name: 'Fixed Allowance', amount: '', ytd: '' },
    { id: 7, name: 'Leave Encashment', amount: '', ytd: '' },
  ],
  deductions: [
    { id: 1, name: 'Income Tax', amount: '', ytd: '' },
  ],
  reimbursements: '',
  note: '',
  preparedBy: '',
  checkedBy: '',
  authorisedBy: '',
  declaration: 'I, the undersigned, hereby state that I have received the above said amount as my full and final settlement out of my own free will and choice on tendering my resignation and I assure that I have no grievances, disputes, demands and claims about my legal dues, back wages, reinstatement or reemployment against the company.',
};

export default function FFSFormPane({ ffsData, onFfsChange }) {
  const data = ffsData || defaultFFSState;

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
      earnings: [...data.earnings, { id: Date.now(), name: '', amount: '', ytd: '' }],
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
      deductions: [...data.deductions, { id: Date.now(), name: '', amount: '', ytd: '' }],
    });
  };

  const removeDeduction = (id) => {
    onFfsChange({ ...data, deductions: data.deductions.filter((r) => r.id !== id) });
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
          <input type="text" name="companyName" value={data.companyName} onChange={handleChange} placeholder="e.g. KEVINS CONSULTING ENGINEERING SERVICES PVT LTD" />
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
            <label>Employee No</label>
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
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Date of Joining</label>
            <input type="date" name="dateOfJoining" value={data.dateOfJoining} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>PF A/C Number</label>
            <input type="text" name="pfAccountNumber" value={data.pfAccountNumber} onChange={handleChange} />
          </div>
        </div>
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
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Final Settlement Date</label>
            <input type="date" name="finalSettlementDate" value={data.finalSettlementDate} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Paid Days</label>
            <input type="number" name="paidDays" value={data.paidDays} onChange={handleChange} min="0" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>ESI Number</label>
            <input type="text" name="esiNumber" value={data.esiNumber} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>LOP Days</label>
            <input type="number" name="lopDays" value={data.lopDays} onChange={handleChange} min="0" />
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="form-section">
        <h3 className="form-section-title">Earnings</h3>
        {data.earnings.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input type="text" placeholder="Earning Name" value={row.name} onChange={(e) => handleEarningChange(row.id, 'name', e.target.value)} style={{ flex: 2 }} />
            <input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleEarningChange(row.id, 'amount', e.target.value)} style={{ flex: 1 }} min="0" />
            <input type="number" placeholder="YTD" value={row.ytd} onChange={(e) => handleEarningChange(row.id, 'ytd', e.target.value)} style={{ flex: 1 }} min="0" />
            <button type="button" className="btn btn-outline icon-btn" onClick={() => removeEarning(row.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={addEarning}>
          <Plus size={16} /> Add Earning
        </button>
      </div>

      {/* Deductions */}
      <div className="form-section">
        <h3 className="form-section-title">Deductions</h3>
        {data.deductions.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input type="text" placeholder="Deduction Name" value={row.name} onChange={(e) => handleDeductionChange(row.id, 'name', e.target.value)} style={{ flex: 2 }} />
            <input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleDeductionChange(row.id, 'amount', e.target.value)} style={{ flex: 1 }} min="0" />
            <input type="number" placeholder="YTD" value={row.ytd} onChange={(e) => handleDeductionChange(row.id, 'ytd', e.target.value)} style={{ flex: 1 }} min="0" />
            <button type="button" className="btn btn-outline icon-btn" onClick={() => removeDeduction(row.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={addDeduction}>
          <Plus size={16} /> Add Deduction
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
