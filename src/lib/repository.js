import { supabase, isSupabaseConfigured } from './supabase';

const mapEmployeeFromRow = (row) => ({
  id: row.id,
  employeeName: row.employee_name || '',
  employeeId: row.employee_code || '',
  branch: row.branch || 'India',
  designation: row.designation || '',
  department: row.department || '',
  location: row.location || '',
  city: row.city || '',
  group: row.group_name || '',
  panNumber: row.pan_number || '',
  aadhaarNumber: row.aadhaar_number || '',
  joiningDate: row.joining_date || '',
  companyName: row.company_name || '',
  companyAddress: row.company_address || '',
  company: row.company_name || '',
  bankName: row.bank_name || '',
  accountNumber: row.account_number || '',
  ifscCode: row.ifsc_code || '',
  pfAccountNumber: row.pf_account_number || '',
  uanNumber: row.uan_number || '',
  esicAccountNumber: row.esic_account_number || '',
  branchOffice: row.branch_office || '',
  taxRegime: row.tax_regime || 'New Tax Regime',
  earnings: Array.isArray(row.earnings) ? row.earnings : [],
  deductions: Array.isArray(row.deductions) ? row.deductions : [],
});

const mapEmployeeToRow = (formData) => ({
  employee_name: formData.employeeName,
  employee_code: formData.employeeId || null,
  branch: formData.branch,
  designation: formData.designation || null,
  department: formData.department || null,
  location: formData.location || null,
  city: formData.city || null,
  group_name: formData.group || null,
  pan_number: formData.panNumber || null,
  aadhaar_number: formData.aadhaarNumber || null,
  joining_date: formData.joiningDate || null,
  company_name: formData.companyName || formData.company || null,
  company_address: formData.companyAddress || null,
  bank_name: formData.bankName || null,
  account_number: formData.accountNumber || null,
  ifsc_code: formData.ifscCode || null,
  pf_account_number: formData.pfAccountNumber || null,
  uan_number: formData.uanNumber || null,
  esic_account_number: formData.esicAccountNumber || null,
  branch_office: formData.branchOffice || null,
  tax_regime: formData.taxRegime || null,
  earnings: formData.earnings,
  deductions: formData.deductions,
});

export const fetchEmployees = async () => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('employee_name', { ascending: true });

  if (error) {
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
    throw error;
  }

  return data ? {
    ...data,
    monthYear: data.month_year,
    employeeId: data.employee_code,
    employeeName: data.employee_name
  } : null;
};
