import { supabase, isSupabaseConfigured } from './supabase';

const getIdentificationValue = (identification, name) => {
  if (!Array.isArray(identification)) return null;
  return identification.find(i => i.name?.toLowerCase() === name.toLowerCase())?.value || null;
};

const mapEmployeeFromRow = (row) => ({
  id: row.id,
  employeeName: row.employee_name || '',
  employeeId: row.employee_code || '',
  branch: row.branch || 'India',
  designation: row.designation || '',
  location: row.location || '',
  city: row.city || '',
  joiningDate: row.joining_date || '',
  companyName: row.company_name || '',
  companyAddress: row.company_address || '',
  company: row.company_name || '',
  bankName: row.bank_name || '',
  accountNumber: row.account_number || '',
  branchOffice: row.branch_office || '',
  taxRegime: row.tax_regime || 'New Tax Regime',
  earnings: Array.isArray(row.earnings) ? row.earnings : [],
  deductions: Array.isArray(row.deductions) ? row.deductions : [],
  identification: Array.isArray(row.identification) ? row.identification : [
    { id: 1, name: 'Department', value: row.department || '' },
    { id: 2, name: 'PAN Number', value: row.pan_number || '' },
    { id: 3, name: 'AADHAR No', value: row.aadhaar_number || '' },
    { id: 4, name: 'IFSC Code', value: row.ifsc_code || '' },
    { id: 5, name: 'PF Account Number', value: row.pf_account_number || '' },
    { id: 6, name: 'UAN Number', value: row.uan_number || '' },
    { id: 7, name: 'ESIC Account Number', value: row.esic_account_number || '' },
  ],
});

const mapEmployeeToRow = (formData) => {
  const idents = formData.identification || [];
  return {
    employee_name: formData.employeeName,
    employee_code: formData.employeeId || null,
    branch: formData.branch,
    designation: formData.designation || null,
    location: formData.location || null,
    city: formData.city || null,
    joining_date: formData.joiningDate || null,
    company_name: formData.companyName || formData.company || null,
    company_address: formData.companyAddress || null,
    bank_name: formData.bankName || null,
    account_number: formData.accountNumber || null,
    branch_office: formData.branchOffice || null,
    tax_regime: formData.taxRegime || null,
    earnings: formData.earnings,
    deductions: formData.deductions,
    identification: formData.identification,
    // Sync identification fields back to columns for compatibility
    pan_number: getIdentificationValue(idents, 'PAN Number'),
    aadhaar_number: getIdentificationValue(idents, 'AADHAR No'),
    ifsc_code: getIdentificationValue(idents, 'IFSC Code'),
    pf_account_number: getIdentificationValue(idents, 'PF Account Number'),
    uan_number: getIdentificationValue(idents, 'UAN Number'),
    esic_account_number: getIdentificationValue(idents, 'ESIC Account Number'),
    department: getIdentificationValue(idents, 'Department'),
  };
};

export const fetchEmployees = async () => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('employee_name', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }

  return (data || []).map(mapEmployeeFromRow);
};

export const upsertEmployee = async (formData) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!formData.employeeId?.trim()) {
    throw new Error('Employee code is required.');
  }

  const payload = mapEmployeeToRow(formData);
  const { data, error } = await supabase
    .from('employees')
    .upsert(payload, { onConflict: 'employee_code' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting employee:', error);
    throw error;
  }

  return mapEmployeeFromRow(data);
};

export const fetchPayslips = async () => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('payslips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payslips:', error);
    throw error;
  }

  return (data || []).map(record => ({
    ...record,
    monthYear: record.month_year,
    employeeId: record.employee_code,
    employeeName: record.employee_name
  }));
};

export const insertPayslip = async ({ formData, calculations, employeeId }) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!formData.employeeId?.trim()) {
    throw new Error('Employee code is required.');
  }

  const { data, error } = await supabase
    .from('payslips')
    .upsert({
      employee_id: employeeId || null,
      employee_name: formData.employeeName || 'Unknown Employee',
      employee_code: formData.employeeId,
      branch: formData.branch,
      month_year: formData.monthYear || '',
      total_working_days: Number(formData.workingDays || 0),
      lop: Number(formData.leavesTaken || 0),
      arrears_days: Number(formData.arrearsDays || 0),
      gross_salary: calculations.grossSalary,
      total_deductions: calculations.totalDeductions,
      net_salary: calculations.netSalary,
      payload: formData,
    }, { onConflict: 'employee_code,month_year' })
    .select()
    .single();

  if (error) {
    console.error('Error inserting payslip:', error);
    throw error;
  }

  return data ? {
    ...data,
    monthYear: data.month_year,
    employeeId: data.employee_code,
    employeeName: data.employee_name
  } : null;
};
