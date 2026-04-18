import * as XLSX from 'xlsx';
import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const monthLabel = (value) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const formatDisplayDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/* ===================== EXCEL EXPORT ===================== */
export const exportToExcel = (formData, calculations) => {
  const wb = XLSX.utils.book_new();
  const rows = [];

  rows.push([formData.companyName]);
  rows.push([formData.companySubtitle]);
  rows.push([formData.companyAddress]);
  rows.push([`Payslip for the month of ${monthLabel(formData.monthYear)}`]);
  rows.push([]);

  rows.push(['Employee ID', formData.employeeId, 'Company', formData.company]);
  rows.push(['Employee Name', formData.employeeName, 'Bank Name', formData.bankName]);
  rows.push(['Designation', formData.designation, 'Bank Account Number', formData.accountNumber]);
  rows.push(['Department', formData.department, 'IFSC Code', formData.ifscCode]);
  rows.push(['Date of Joining', formatDisplayDate(formData.joiningDate), 'Days Worked', formData.workingDays]);

  rows.push([]);

  rows.push(['Earnings', 'Monthly Rate', 'Current Month', 'Arrears', 'Total', 'Deductions', 'Amount']);

  const maxRows = Math.max(calculations.earnings.length, calculations.deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const e = calculations.earnings[i] || {};
    const d = calculations.deductions[i] || {};

    rows.push([
      e.name || '',
      e.monthlyRate || '',
      e.currentMonth || '',
      e.arrears || '',
      e.total || '',
      d.name || '',
      d.amount || '',
    ]);
  }

  rows.push([]);
  rows.push(['Total Earnings', calculations.grossSalary, '', '', '', 'Total Deductions', calculations.totalDeductions]);
  rows.push(['Net Salary', calculations.netSalary]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Payslip');

  XLSX.writeFile(
    wb,
    `Payslip_${formData.employeeName || 'Employee'}_${formData.monthYear || 'Month'}.xlsx`
  );
};

/* ===================== DOCX EXPORT ===================== */
export const exportToDocx = async (formData, calculations) => {
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Employee ID')] }),
        new TableCell({ children: [new Paragraph(formData.employeeId || '')] }),
        new TableCell({ children: [new Paragraph('Company')] }),
        new TableCell({ children: [new Paragraph(formData.company || '')] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Employee Name')] }),
        new TableCell({ children: [new Paragraph(formData.employeeName || '')] }),
        new TableCell({ children: [new Paragraph('Bank Name')] }),
        new TableCell({ children: [new Paragraph(formData.bankName || '')] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Designation')] }),
        new TableCell({ children: [new Paragraph(formData.designation || '')] }),
        new TableCell({ children: [new Paragraph('Account Number')] }),
        new TableCell({ children: [new Paragraph(formData.accountNumber || '')] }),
      ],
    }),
  ];

  calculations.earnings.forEach((e) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(e.name || '')] }),
          new TableCell({ children: [new Paragraph(String(e.monthlyRate || ''))] }),
          new TableCell({ children: [new Paragraph(String(e.currentMonth || ''))] }),
          new TableCell({ children: [new Paragraph(String(e.total || ''))] }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: formData.companyName || '', bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Payslip for the month of ${monthLabel(formData.monthYear)}`, size: 26 })],
        }),
        new Paragraph(''),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
        new Paragraph(''),
        new Paragraph({ children: [new TextRun({ text: `Total Earnings: ${calculations.grossSalary}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Total Deductions: ${calculations.totalDeductions}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Net Salary: ${calculations.netSalary}`, bold: true, size: 28 })] }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `Payslip_${formData.employeeName || 'Employee'}_${formData.monthYear || 'Month'}.docx`
  );
};

/* ===================== PDF EXPORT ===================== */
export const exportToPDF = (formData) => {
  const element = document.getElementById("payslip");

  if (!element) {
    alert("Payslip UI not found");
    return;
  }

  const opt = {
    margin: 5,
    filename: `Payslip_${formData.employeeName || 'Employee'}_${formData.monthYear || 'Month'}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(opt).from(element).save();
};