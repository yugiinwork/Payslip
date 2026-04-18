import React, { useEffect, useRef, useState } from 'react';
import FormPane from './components/FormPane';
import PreviewPane from './components/PreviewPane';
import PreviousPayslipsPage from './components/PreviousPayslipsPage';
import { calculateSalary } from './utils/calculations';
import { exportToPDF } from './utils/export';
import { fetchEmployees, fetchPayslips, insertPayslip, upsertEmployee } from './lib/repository';
import { isSupabaseConfigured } from './lib/supabase';

const PROFILE_STORAGE_KEY = 'payslip_profiles';
const PAYSLIPS_STORAGE_KEY = 'payslip_records';
const NON_PERSISTED_FIELDS = new Set(['monthYear', 'workingDays', 'leavesTaken']);

const BRANCH_PRESETS = {
  UAE: {
    companyName: 'KEVINS ENGINEERING CONSULTANCY LLC',
    companySubtitle: '',
    companyAddress: 'Salam Street, Office 402, GTH Building, Behind Majlis Residency, Abu Dhabi 53040',
    company: 'KEVINS ENGINEERING CONSULTANCY LLC',
  },
  India: {
    companyName: 'KEVINS CONSULTING ENGINEERING SERVICES PVT. LTD',
    companySubtitle: '',
    companyAddress: 'Plot no: 66,67, 3rd floor, SS Fortune building, Balaji nagar, Kukatpally, Hyderabad, Telangana 500072',
    company: 'KEVINS CONSULTING ENGINEERING SERVICES PVT. LTD',
  },
};

const EARNING_TEMPLATES = {
  India: [
    { id: 1, name: 'Basic', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 2, name: 'HRA', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 3, name: 'Conveyance', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 4, name: 'Medical Allowances', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 5, name: 'LTA (Leave Travel Allowance)', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 6, name: 'CEA (Children Education Allowance)', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 7, name: 'Other Allowances', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
  ],
  UAE: [
    { id: 1, name: 'Basic Salary', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
    { id: 2, name: 'Other Allowances', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
  ],
};

const DEDUCTION_TEMPLATES = {
  India: [
    { id: 1, name: 'PF', amount: '' },
    { id: 2, name: 'Gratuity', amount: '' },
    { id: 3, name: 'PF Employer', amount: '' },
    { id: 4, name: 'Professional Tax', amount: '' },
  ],
  UAE: [],
};

const buildEarningsForBranch = (branch) =>
  EARNING_TEMPLATES[branch].map((row) => ({ ...row }));

const buildDeductionsForBranch = (branch) =>
  DEDUCTION_TEMPLATES[branch].map((row) => ({ ...row }));

const getPreviousMonthInfo = () => {
  const now = new Date();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
  const year = previousMonthDate.getFullYear();
  const month = String(previousMonthDate.getMonth() + 1).padStart(2, '0');
  const daysInMonth = previousMonthDate.getDate();

  return {
    monthYear: `${year}-${month}`,
    totalDays: String(daysInMonth),
  };
};

const getDaysInMonthFromValue = (monthYear) => {
  if (!monthYear) {
    return '';
  }

  const [year, month] = monthYear.split('-').map(Number);
  if (!year || !month) {
    return '';
  }

  return String(new Date(year, month, 0).getDate());
};

const applyDerivedValues = (data) => {
  const workingDays = parseFloat(data.workingDays) || 0;
  const leavesTaken = parseFloat(data.leavesTaken) || 0;
  const arrearsDays = parseFloat(data.arrearsDays) || 0;
  const payableDays = Math.max(workingDays - leavesTaken, 0);
  const earningsRatio = workingDays > 0 ? payableDays / workingDays : 0;
  const arrearsRatio = workingDays > 0 ? arrearsDays / workingDays : 0;

  const nextEarnings = data.earnings.map((row) => {
    const monthlyRate = parseFloat(row.monthlyRate) || 0;
    const currentMonth = (monthlyRate * earningsRatio).toFixed(2);
    const arrears = (monthlyRate * arrearsRatio).toFixed(2);
    const total = (parseFloat(currentMonth) + parseFloat(arrears)).toFixed(2);

    return { ...row, currentMonth, arrears, total };
  });

  return { ...data, earnings: nextEarnings };
};

const createDefaultState = (branch = 'India') => {
  const previousMonthInfo = getPreviousMonthInfo();

  return {
  branch,
  employeeName: '',
  employeeId: '',
  designation: '',
  department: '',
  location: '',
  city: '',
  group: '',
  panNumber: '',
  aadhaarNumber: '',
  joiningDate: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  pfAccountNumber: '',
  uanNumber: '',
  esicAccountNumber: '',
  monthYear: previousMonthInfo.monthYear,
  workingDays: previousMonthInfo.totalDays,
  leavesTaken: '0',
  paymentDate: '',
  branchOffice: '',
  arrearsDays: '0',
  taxRegime: 'New Tax Regime',
  earnings: buildEarningsForBranch(branch),
  deductions: buildDeductionsForBranch(branch),
  ...BRANCH_PRESETS[branch],
  };
};

const sanitizeForProfile = (data) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !NON_PERSISTED_FIELDS.has(key)));

const loadProfilesFromStorage = () => {
  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const hydrateProfile = (profile) => {
  const branch = profile.branch || 'India';
  return {
    ...createDefaultState(branch),
    ...profile,
    earnings: profile.earnings?.length ? profile.earnings : buildEarningsForBranch(branch),
    deductions: profile.deductions?.length ? profile.deductions : buildDeductionsForBranch(branch),
  };
};

const persistProfilesToStorage = (profiles) => {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage failures for now; this adapter can be replaced with Supabase later.
  }
};

const loadPayslipsFromStorage = () => {
  try {
    const saved = window.localStorage.getItem(PAYSLIPS_STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistPayslipsToStorage = (records) => {
  try {
    window.localStorage.setItem(PAYSLIPS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage failures for now; this adapter can be replaced with Supabase later.
  }
};

function App() {
  const [savedProfiles, setSavedProfiles] = useState(() => loadProfilesFromStorage());
  const [savedPayslips, setSavedPayslips] = useState(() => loadPayslipsFromStorage());
  const [currentPage, setCurrentPage] = useState('builder');
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState(null);
  const [formData, setFormData] = useState(() => {
    const profiles = loadProfilesFromStorage();
    const firstProfileKey = Object.keys(profiles)[0];
    return firstProfileKey ? hydrateProfile(profiles[firstProfileKey]) : createDefaultState();
  });
  const hasHydratedProfile = useRef(false);

  const [calculations, setCalculations] = useState(calculateSalary(formData));
  const [statusMessage, setStatusMessage] = useState(isSupabaseConfigured ? 'Supabase connected.' : 'Supabase not configured. Using local storage fallback.');

  useEffect(() => {
    setCalculations(calculateSalary(formData));
  }, [formData]);

  useEffect(() => {
    setFormData((prev) => {
      const nextData = applyDerivedValues(prev);

      const hasChanged = nextData.earnings.some((row, index) =>
        row.currentMonth !== prev.earnings[index]?.currentMonth ||
        row.arrears !== prev.earnings[index]?.arrears ||
        row.total !== prev.earnings[index]?.total
      );

      return hasChanged ? nextData : prev;
    });
  }, [formData.workingDays, formData.leavesTaken, formData.arrearsDays, formData.earnings]);

  useEffect(() => {
    if (!hasHydratedProfile.current) {
      const bootstrap = async () => {
        if (isSupabaseConfigured) {
          try {
            const [employees, payslips] = await Promise.all([fetchEmployees(), fetchPayslips()]);
            const profiles = Object.fromEntries(
              employees.map((employee) => [employee.employeeId || employee.employeeName, employee])
            );
            const firstProfileKey = Object.keys(profiles)[0];

            setSavedProfiles(profiles);
            setSavedPayslips(payslips);

            if (firstProfileKey) {
              setFormData((prev) => ({
                ...hydrateProfile(profiles[firstProfileKey]),
                monthYear: prev.monthYear,
                workingDays: prev.workingDays,
                leavesTaken: prev.leavesTaken,
                arrearsDays: prev.arrearsDays,
              }));
            }

            setStatusMessage('Loaded employees and payslips from Supabase.');
          } catch {
            const profiles = loadProfilesFromStorage();
            const firstProfileKey = Object.keys(profiles)[0];
            setSavedProfiles(profiles);
            setSavedPayslips(loadPayslipsFromStorage());
            if (firstProfileKey) {
              setFormData((prev) => ({
                ...hydrateProfile(profiles[firstProfileKey]),
                monthYear: prev.monthYear,
                workingDays: prev.workingDays,
                leavesTaken: prev.leavesTaken,
                arrearsDays: prev.arrearsDays,
              }));
            }
            setStatusMessage('Supabase tables are not ready yet. Using local storage fallback.');
          }
        } else {
          const profiles = loadProfilesFromStorage();
          const firstProfileKey = Object.keys(profiles)[0];
          setSavedProfiles(profiles);
          setSavedPayslips(loadPayslipsFromStorage());
          if (firstProfileKey) {
            setFormData((prev) => ({
              ...hydrateProfile(profiles[firstProfileKey]),
              monthYear: prev.monthYear,
              workingDays: prev.workingDays,
              leavesTaken: prev.leavesTaken,
              arrearsDays: prev.arrearsDays,
            }));
          }
        }
      };

      bootstrap();
      hasHydratedProfile.current = true;
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'monthYear') {
        return {
          ...prev,
          monthYear: value,
          workingDays: getDaysInMonthFromValue(value),
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleEmployeeNameChange = (e) => {
    const employeeName = e.target.value;
    const matchedProfile = Object.values(savedProfiles).find(
      (profile) => profile.employeeName?.toLowerCase() === employeeName.toLowerCase()
    );

    if (employeeName && matchedProfile) {
      setFormData((prev) => ({
        ...hydrateProfile(matchedProfile),
        monthYear: prev.monthYear,
        workingDays: prev.workingDays,
        leavesTaken: prev.leavesTaken,
        arrearsDays: prev.arrearsDays,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, employeeName }));
  };

  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    setFormData((prev) =>
      applyDerivedValues({
        ...prev,
        branch: newBranch,
        earnings: buildEarningsForBranch(newBranch),
        deductions: buildDeductionsForBranch(newBranch),
        ...BRANCH_PRESETS[newBranch],
      })
    );
  };

  const handleEarningChange = (id, field, value) => {
    if (field !== 'name' && field !== 'monthlyRate') {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addEarning = () => {
    setFormData((prev) => ({
      ...prev,
      earnings: [
        ...prev.earnings,
        { id: Date.now(), name: '', monthlyRate: '', currentMonth: '', arrears: '', total: '' },
      ],
    }));
  };

  const removeEarning = (id) => {
    setFormData((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((item) => item.id !== id),
    }));
  };

  const handleDeductionChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { id: Date.now(), name: '', amount: '' }],
    }));
  };

  const removeDeduction = (id) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((item) => item.id !== id),
    }));
  };

  const saveProfile = () => {
    const profileName = formData.employeeName.trim();
    const profileKey = formData.employeeId.trim();

    if (!profileKey || !profileName) {
      alert('Enter employee code and employee name first.');
      return;
    }

    const nextProfiles = {
      ...savedProfiles,
      [profileKey]: sanitizeForProfile(formData),
    };

    setSavedProfiles(nextProfiles);
    persistProfilesToStorage(nextProfiles);

    const persistRemote = async () => {
      if (!isSupabaseConfigured) {
        alert('Auto-fill profile updated locally.');
        return;
      }

      try {
        await upsertEmployee(formData);
        setStatusMessage('Employee profile saved to Supabase.');
        alert('Auto-fill profile updated.');
      } catch {
        setStatusMessage('Could not save to Supabase. Kept a local fallback copy.');
        alert('Saved locally. Run the Supabase schema, then try again.');
      }
    };

    persistRemote();
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form?')) {
      setFormData(createDefaultState());
    }
  };

  const buildPayslipRecord = (data) => ({
    id: `${data.employeeId || data.employeeName || 'employee'}-${data.monthYear || 'month'}`,
    employeeName: data.employeeName || 'Unknown Employee',
    employeeId: data.employeeId || '',
    monthYear: data.monthYear || '',
    branch: data.branch,
    createdAt: new Date().toISOString(),
    payload: JSON.parse(JSON.stringify(data)),
  });

  const savePayslipRecord = (data) => {
    const record = buildPayslipRecord(data);
    const nextRecords = [
      record,
      ...savedPayslips.filter(
        (item) =>
          !(
            (item.employeeId || item.employeeName) === (record.employeeId || record.employeeName) &&
            item.monthYear === record.monthYear
          )
      ),
    ];
    setSavedPayslips(nextRecords);
    persistPayslipsToStorage(nextRecords);
    return record;
  };

  const downloadSavedPayslip = (record) => {
    setSelectedPayslipRecord(record);
    window.setTimeout(() => {
      exportToPDF(record.payload);
    }, 150);
  };

  const handlePrintPdf = () => {
    const localRecord = savePayslipRecord(formData);

    const persistRemote = async () => {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const employee = await upsertEmployee(formData);
        const payslip = await insertPayslip({ formData, calculations, employeeId: employee?.id });
        if (payslip) {
          setSavedPayslips((prev) => [
            payslip,
            ...prev.filter(
              (item) =>
                !(
                  item.employeeId === localRecord.employeeId &&
                  item.monthYear === localRecord.monthYear &&
                  item.branch === localRecord.branch
                )
            ),
          ]);
        }
        setStatusMessage('Payslip archived in Supabase.');
      } catch {
        setStatusMessage('Could not archive payslip in Supabase. Kept a local fallback copy.');
      }
    };

    persistRemote();
    window.print();
  };

  const profileOptions = Object.values(savedProfiles)
    .map((profile) => profile.employeeName)
    .filter(Boolean)
    .filter((name, index, array) => array.findIndex((item) => item.toLowerCase() === name.toLowerCase()) === index)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  if (currentPage === 'history') {
    return (
      <PreviousPayslipsPage
        savedPayslips={savedPayslips}
        selectedPayslipRecord={selectedPayslipRecord}
        onBack={() => setCurrentPage('builder')}
        onSelectPayslip={setSelectedPayslipRecord}
        onDownloadPayslip={downloadSavedPayslip}
      />
    );
  }

  return (
    <div className="app-container">
      <FormPane
        formData={formData}
        profileOptions={profileOptions}
        statusMessage={statusMessage}
        handleInputChange={handleInputChange}
        handleBranchChange={handleBranchChange}
        handleEmployeeNameChange={handleEmployeeNameChange}
        handleEarningChange={handleEarningChange}
        addEarning={addEarning}
        removeEarning={removeEarning}
        handleDeductionChange={handleDeductionChange}
        addDeduction={addDeduction}
        removeDeduction={removeDeduction}
        saveProfile={saveProfile}
        resetForm={resetForm}
        viewPreviousPayslips={() => {
          setSelectedPayslipRecord(savedPayslips[0] || null);
          setCurrentPage('history');
        }}
      />
      <PreviewPane formData={formData} calculations={calculations} onPrintPdf={handlePrintPdf} />
    </div>
  );
}

export default App;
