import React from 'react';
import { Plus, Trash2, Save, RotateCcw, Cloud, CheckCircle2, AlertCircle, Loader2, GripVertical } from 'lucide-react';

export default function FormPane({
  formData,
  profileOptions,
  statusMessage,
  statusType,
  handleInputChange,
  handleBranchChange,
  handleEmployeeNameChange,
  handleEarningChange,
  addEarning,
  removeEarning,
  moveEarning,
  handleDeductionChange,
  addDeduction,
  removeDeduction,
  moveDeduction,
  handleIdentificationChange,
  addIdentification,
  removeIdentification,
  moveIdentification,
  saveProfile,
  resetForm,
  viewPreviousPayslips,
}) {
  return (
    <div className="form-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>Payslip Format Builder</h2>
      </div>

      <div className={`status-banner status-banner-${statusType}`}>
        {statusType === 'success' && <CheckCircle2 size={16} />}
        {statusType === 'error' && <AlertCircle size={16} />}
        {statusType === 'warning' && <AlertCircle size={16} />}
        {statusType === 'info' && <Loader2 size={16} className="animate-spin" />}
        {statusMessage}
      </div>

      <div className="form-section">
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>Company Branch</label>
        <select
          value={formData.branch}
          onChange={handleBranchChange}
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '16px' }}
        >
          <option value="UAE">UAE Branch</option>
          <option value="India">Hyderabad Branch</option>
        </select>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={saveProfile} style={{ flex: 1 }}>
            <Cloud size={18} /> Save to Cloud / Update
          </button>
          <button className="btn btn-outline" onClick={viewPreviousPayslips} style={{ flex: 1 }}>
            View Previous Payslips
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button className="btn btn-outline" onClick={resetForm} style={{ flex: 1 }}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Employee Details</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Employee Code</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Employee Name</label>
            <input
              type="text"
              name="employeeName"
              list="employee-name-options"
              value={formData.employeeName}
              onChange={handleEmployeeNameChange}
              placeholder="Search by employee name"
            />
            <datalist id="employee-name-options">
              {profileOptions.map((profileName) => (
                <option key={profileName} value={profileName} />
              ))}
            </datalist>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Branch</label>
            <input type="text" name="branchOffice" value={formData.branchOffice} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
          </div>
        </div>
        <div className="input-group">
          <label>Date of Joining</label>
          <input type="date" name="joiningDate" lang="en-GB" value={formData.joiningDate} onChange={handleInputChange} />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Identification & Account Details</h3>
        {formData.identification.map((item) => (
          <div 
            key={item.id} 
            className="grid-row-card deduction-row"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('draggedId', item.id);
              e.currentTarget.classList.add('dragging');
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove('dragging');
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = Number(e.dataTransfer.getData('draggedId'));
              moveIdentification(draggedId, item.id);
            }}
          >
            <div className="drag-handle">
              <GripVertical size={16} />
            </div>
            <input
              type="text"
              placeholder="Label"
              value={item.name}
              onChange={(e) => handleIdentificationChange(item.id, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Value"
              value={item.value}
              onChange={(e) => handleIdentificationChange(item.id, 'value', e.target.value)}
            />
            <button className="btn btn-outline icon-btn" onClick={() => removeIdentification(item.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button className="btn btn-outline" style={{ marginTop: '8px', width: '100%' }} onClick={addIdentification}>
          <Plus size={16} /> Add Identification Row
        </button>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Payroll Details</h3>
        <div className="input-group">
          <label>Payslip Month</label>
          <input type="month" name="monthYear" value={formData.monthYear} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Company</label>
          <input type="text" name="company" value={formData.company} onChange={handleInputChange} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Bank Name</label>
            <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Account Number</label>
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Total Working Days</label>
            <input type="number" min="0" name="workingDays" value={formData.workingDays} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>LOP</label>
            <input type="number" min="0" name="leavesTaken" value={formData.leavesTaken} onChange={handleInputChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Arrears Days</label>
            <input type="number" min="0" step="0.01" name="arrearsDays" value={formData.arrearsDays} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Tax Regime</label>
            <input type="text" name="taxRegime" value={formData.taxRegime} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Earnings Table</h3>
        {formData.earnings.map((earning) => (
          <div 
            key={earning.id} 
            className="grid-row-card"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('draggedId', earning.id);
              e.currentTarget.classList.add('dragging');
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove('dragging');
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = Number(e.dataTransfer.getData('draggedId'));
              moveEarning(draggedId, earning.id);
            }}
          >
            <div className="drag-handle">
              <GripVertical size={16} />
            </div>
            <input type="text" placeholder="Earning Name" value={earning.name} onChange={(e) => handleEarningChange(earning.id, 'name', e.target.value)} />
            <input type="number" min="0" placeholder="Monthly Rate" value={earning.monthlyRate} onChange={(e) => handleEarningChange(earning.id, 'monthlyRate', e.target.value)} />
            <input type="number" min="0" placeholder="Current Month" value={earning.currentMonth} readOnly />
            <input type="number" min="0" placeholder="Arrears" value={earning.arrears} readOnly />
            <input type="number" min="0" placeholder="Total" value={earning.total} readOnly />
            <button className="btn btn-outline icon-btn" onClick={() => removeEarning(earning.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button className="btn btn-outline" style={{ marginTop: '8px', width: '100%' }} onClick={addEarning}>
          <Plus size={16} /> Add Earning Row
        </button>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Deductions Table</h3>
        {formData.deductions.length === 0 ? (
          <div className="table-row-label">No deduction rows for this branch.</div>
        ) : null}
        {formData.deductions.map((deduction) => (
          <div 
            key={deduction.id} 
            className="grid-row-card deduction-row"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('draggedId', deduction.id);
              e.currentTarget.classList.add('dragging');
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove('dragging');
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = Number(e.dataTransfer.getData('draggedId'));
              moveDeduction(draggedId, deduction.id);
            }}
          >
            <div className="drag-handle">
              <GripVertical size={16} />
            </div>
            <input type="text" placeholder="Deduction Name" value={deduction.name} onChange={(e) => handleDeductionChange(deduction.id, 'name', e.target.value)} />
            <input type="number" min="0" placeholder="Amount" value={deduction.amount} onChange={(e) => handleDeductionChange(deduction.id, 'amount', e.target.value)} />
            <button className="btn btn-outline icon-btn" onClick={() => removeDeduction(deduction.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button className="btn btn-outline" style={{ marginTop: '8px', width: '100%' }} onClick={addDeduction}>
          <Plus size={16} /> Add Deduction Row
        </button>
      </div>
      <div style={{ height: '40px' }}></div>
    </div>
  );
}
