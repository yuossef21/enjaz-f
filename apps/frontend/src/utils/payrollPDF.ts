import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PayrollData {
  employee_name: string;
  position?: string;
  department?: string;
  month: string;
  year: number;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
}

export const generatePayrollPDF = (data: PayrollData) => {
  const doc = new jsPDF();

  // Add Arabic font support
  doc.setLanguage('ar');

  // Header - Company Logo Area (placeholder)
  doc.setFillColor(255, 140, 0); // Orange color
  doc.rect(10, 10, 30, 30, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('إنجاز', 25, 25, { align: 'center' });
  doc.text('للتوصيل السريع', 25, 32, { align: 'center' });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('فاتورة راتب موظفين', 105, 25, { align: 'center' });

  // Date
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('ar-IQ');
  doc.text(`التاريخ: ${today}`, 170, 25);

  // Employee Info Box
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 50, 190, 30, 'F');

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`اسم الموظف: ${data.employee_name}`, 15, 60);

  if (data.position) {
    doc.text(`المنصب: ${data.position}`, 15, 68);
  }

  if (data.department) {
    doc.text(`القسم: ${data.department}`, 15, 76);
  }

  // Month/Year
  const monthNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthName = monthNames[parseInt(data.month)];
  doc.text(`الشهر/السنة: ${monthName} ${data.year}`, 120, 60);

  // Table
  const tableData = [
    ['الراتب الأساسي', `${data.base_salary.toLocaleString('ar-IQ')} د.ع`],
    ['البدلات', `${data.bonuses.toLocaleString('ar-IQ')} د.ع`],
    ['الخصومات', `${data.deductions.toLocaleString('ar-IQ')} د.ع`],
  ];

  (doc as any).autoTable({
    startY: 90,
    head: [['البيان', 'المبلغ']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 11,
      halign: 'right',
    },
    headStyles: {
      fillColor: [255, 140, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: 10, right: 10 },
  });

  // Net Salary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(255, 140, 0);
  doc.rect(10, finalY, 190, 12, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`إجمالي الصافي: ${data.net_salary.toLocaleString('ar-IQ')} د.ع`, 105, finalY + 8, { align: 'center' });

  // Signatures
  const sigY = finalY + 40;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // Accountant signature
  doc.text('توقيع المحاسب', 50, sigY);
  doc.line(30, sigY + 5, 80, sigY + 5);
  doc.text('(المحاسب)', 50, sigY + 12, { align: 'center' });

  // Employee signature
  doc.text('توقيع الموظف', 150, sigY);
  doc.line(130, sigY + 5, 180, sigY + 5);
  doc.text('(المستلم)', 150, sigY + 12, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('تم إنشاء هذا المستند من نظام إنجاز', 105, 280, { align: 'center' });
  doc.text('megarecon.com', 105, 285, { align: 'center' });

  // Save PDF
  doc.save(`payroll-${data.employee_name}-${data.month}-${data.year}.pdf`);
};
