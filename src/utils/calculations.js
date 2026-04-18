export const calculateSalary = (data) => {
  const workingDays = parseFloat(data.workingDays) || 0;
  const leavesTaken = parseFloat(data.leavesTaken) || 0;
  const arrearsDays = parseFloat(data.arrearsDays) || 0;
  const payableDays = Math.max(workingDays - leavesTaken, 0);
  const paidDays = Math.max(payableDays + arrearsDays, 0);
  const deductionRatio = workingDays > 0 ? paidDays / workingDays : 0;

  const earnings = data.earnings.map((row) => {
    const monthlyRate = parseFloat(row.monthlyRate) || 0;
    const currentMonth = workingDays > 0 ? (monthlyRate / workingDays) * payableDays : 0;
    const arrears = workingDays > 0 ? (monthlyRate / workingDays) * arrearsDays : 0;
    const total = currentMonth + arrears;

    return {
      ...row,
      monthlyRate,
      currentMonth: currentMonth.toFixed(2),
      arrears: arrears.toFixed(2),
      total: total.toFixed(2),
    };
  });

  const deductions = data.deductions.map((row) => ({
    ...row,
    amount: parseFloat(row.amount) || 0,
  }));

  const grossSalary = earnings.reduce((sum, row) => sum + parseFloat(row.total), 0);
  const totalDeductions = deductions.reduce((sum, row) => sum + (row.amount * deductionRatio), 0);
  const netSalary = grossSalary - totalDeductions;

  return {
    earnings,
    deductions: deductions.map((deduction) => ({
      ...deduction,
      amount: (deduction.amount * deductionRatio).toFixed(2),
    })),
    grossSalary: grossSalary.toFixed(2),
    totalDeductions: totalDeductions.toFixed(2),
    netSalary: netSalary.toFixed(2),
    paidDays,
    ratio: deductionRatio,
    finalPayable: netSalary.toFixed(2),
  };
};
