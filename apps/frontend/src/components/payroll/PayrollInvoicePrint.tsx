import { useEffect } from 'react';

interface PayrollInvoiceProps {
  data: {
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
  };
  onClose: () => void;
}

export const PayrollInvoicePrint = ({ data, onClose }: PayrollInvoiceProps) => {
  useEffect(() => {
    // Open print in a new window
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      const getMonthName = (month: string) => {
        const months: Record<string, string> = {
          '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
          '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
          '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
        };
        return months[month] || month;
      };

      const today = new Date().toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>فاتورة راتب - ${data.employee_name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 20mm;
              color: #1f2937;
            }

            .invoice-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #f97316;
            }

            .logo-section {
              display: flex;
              align-items: center;
              gap: 15px;
            }

            .logo {
              width: 80px;
              height: 80px;
              background: #f97316;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              color: white;
            }

            .logo-title {
              font-size: 24px;
              font-weight: bold;
            }

            .logo-subtitle {
              font-size: 11px;
              margin-top: 2px;
            }

            .header-text h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 5px;
            }

            .header-text p {
              color: #6b7280;
              font-size: 14px;
            }

            .date-section {
              text-align: left;
            }

            .date-section p:first-child {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }

            .date-section p:last-child {
              font-weight: 600;
              font-size: 14px;
            }

            .employee-info {
              background: #f9fafb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
            }

            .employee-info h2 {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .info-item p:first-child {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }

            .info-item p:last-child {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }

            .salary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }

            .salary-table thead {
              background: #f97316;
              color: white;
            }

            .salary-table th {
              padding: 15px 20px;
              text-align: right;
              font-size: 16px;
              font-weight: bold;
              border: 1px solid #ea580c;
            }

            .salary-table td {
              padding: 15px 20px;
              border: 1px solid #d1d5db;
              font-size: 15px;
            }

            .salary-table tbody tr:nth-child(odd) {
              background: white;
            }

            .salary-table tbody tr:nth-child(even) {
              background: #f9fafb;
            }

            .salary-table .label-cell {
              color: #1f2937;
              font-weight: 500;
            }

            .salary-table .amount-cell {
              color: #111827;
              font-weight: 600;
            }

            .salary-table .bonus-cell {
              color: #059669;
            }

            .salary-table .deduction-cell {
              color: #dc2626;
            }

            .net-salary {
              background: #f97316;
              color: white;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .net-salary span:first-child {
              font-size: 18px;
              font-weight: bold;
            }

            .net-salary span:last-child {
              font-size: 28px;
              font-weight: bold;
            }

            .signatures {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 50px;
              margin-top: 60px;
            }

            .signature-box {
              text-align: center;
            }

            .signature-line {
              border-top: 2px solid #9ca3af;
              padding-top: 10px;
              margin-bottom: 8px;
            }

            .signature-line p {
              color: #6b7280;
              font-size: 13px;
            }

            .signature-role {
              color: #9ca3af;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 0;
                margin: 0;
              }

              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <div class="logo">
                  <div class="logo-title">إنجاز</div>
                  <div class="logo-subtitle">للتوصيل السريع</div>
                </div>
                <div class="header-text">
                  <h1>فاتورة راتب موظفين</h1>
                  <p>Payroll Invoice</p>
                </div>
              </div>
              <div class="date-section">
                <p>التاريخ</p>
                <p>${today}</p>
              </div>
            </div>

            <!-- Employee Info -->
            <div class="employee-info">
              <h2>معلومات الموظف</h2>
              <div class="info-grid">
                <div class="info-item">
                  <p>اسم الموظف</p>
                  <p>${data.employee_name}</p>
                </div>
                ${data.position ? `
                <div class="info-item">
                  <p>المنصب</p>
                  <p>${data.position}</p>
                </div>
                ` : ''}
                ${data.department ? `
                <div class="info-item">
                  <p>القسم</p>
                  <p>${data.department}</p>
                </div>
                ` : ''}
                <div class="info-item">
                  <p>الشهر / السنة</p>
                  <p>${getMonthName(data.month)} ${data.year}</p>
                </div>
              </div>
            </div>

            <!-- Salary Details Table -->
            <table class="salary-table">
              <thead>
                <tr>
                  <th>البيان</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="label-cell">الراتب الأساسي</td>
                  <td class="amount-cell">${data.base_salary.toLocaleString('ar-IQ')} د.ع</td>
                </tr>
                <tr>
                  <td class="label-cell">البدلات</td>
                  <td class="amount-cell bonus-cell">+${data.bonuses.toLocaleString('ar-IQ')} د.ع</td>
                </tr>
                <tr>
                  <td class="label-cell">الخصومات</td>
                  <td class="amount-cell deduction-cell">-${data.deductions.toLocaleString('ar-IQ')} د.ع</td>
                </tr>
              </tbody>
            </table>

            <!-- Net Salary -->
            <div class="net-salary">
              <span>إجمالي الصافي</span>
              <span>${data.net_salary.toLocaleString('ar-IQ')} د.ع</span>
            </div>

            <!-- Signatures -->
            <div class="signatures">
              <div class="signature-box">
                <div class="signature-line">
                  <p>توقيع المحاسب</p>
                </div>
                <p class="signature-role">(المحاسب)</p>
              </div>
              <div class="signature-box">
                <div class="signature-line">
                  <p>توقيع الموظف</p>
                </div>
                <p class="signature-role">(المستلم)</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
    }

    // Close the modal immediately
    onClose();
  }, [data, onClose]);

  return null;
};
