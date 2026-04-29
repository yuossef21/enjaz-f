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
    // Add print class to body and hide root
    document.body.classList.add('printing-invoice');
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'none';
    }

    // Auto print when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('printing-invoice');
      if (root) {
        root.style.display = 'block';
      }
    };
  }, []);

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

  return (
    <>
      <style>{`
        @media print {
          body.printing-invoice * {
            visibility: hidden;
          }
          body.printing-invoice .print-invoice-content,
          body.printing-invoice .print-invoice-content * {
            visibility: visible;
          }
          body.printing-invoice .print-invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="no-print fixed top-4 right-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            طباعة
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            إغلاق
          </button>
        </div>

        <div className="print-invoice-content max-w-4xl mx-auto p-8 bg-white" dir="rtl">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-orange-500 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-orange-500 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">إنجاز</div>
                  <div className="text-sm">للتوصيل السريع</div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">فاتورة راتب موظفين</h1>
                <p className="text-gray-600 mt-1">Payroll Invoice</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">التاريخ</p>
              <p className="font-semibold">{today}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات الموظف</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">اسم الموظف</p>
                <p className="font-semibold text-lg">{data.employee_name}</p>
              </div>
              {data.position && (
                <div>
                  <p className="text-sm text-gray-600">المنصب</p>
                  <p className="font-semibold">{data.position}</p>
                </div>
              )}
              {data.department && (
                <div>
                  <p className="text-sm text-gray-600">القسم</p>
                  <p className="font-semibold">{data.department}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">الشهر / السنة</p>
                <p className="font-semibold">{getMonthName(data.month)} {data.year}</p>
              </div>
            </div>
          </div>

          {/* Salary Details Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="border border-orange-600 px-6 py-3 text-right text-lg font-bold">
                    البيان
                  </th>
                  <th className="border border-orange-600 px-6 py-3 text-right text-lg font-bold">
                    المبلغ
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-6 py-4 text-gray-800 font-medium">
                    الراتب الأساسي
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-gray-900 font-semibold">
                    {data.base_salary.toLocaleString('ar-IQ')} د.ع
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 text-gray-800 font-medium">
                    البدلات
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-green-600 font-semibold">
                    +{data.bonuses.toLocaleString('ar-IQ')} د.ع
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-6 py-4 text-gray-800 font-medium">
                    الخصومات
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-red-600 font-semibold">
                    -{data.deductions.toLocaleString('ar-IQ')} د.ع
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary */}
          <div className="bg-orange-500 text-white rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">إجمالي الصافي</span>
              <span className="text-3xl font-bold">
                {data.net_salary.toLocaleString('ar-IQ')} د.ع
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-16">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2">
                <p className="text-gray-600 text-sm">توقيع المحاسب</p>
              </div>
              <p className="text-gray-500 text-xs">(المحاسب)</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2">
                <p className="text-gray-600 text-sm">توقيع الموظف</p>
              </div>
              <p className="text-gray-500 text-xs">(المستلم)</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
