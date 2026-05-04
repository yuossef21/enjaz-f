import { useQuery } from '@tanstack/react-query';
import { paymentVouchersService } from '@/services/payment-vouchers.service';
import { X, Printer } from 'lucide-react';

interface PaymentVoucherPrintProps {
  voucherId: string;
  onClose: () => void;
}

export const PaymentVoucherPrint = ({ voucherId, onClose }: PaymentVoucherPrintProps) => {
  const { data: voucher, isLoading } = useQuery({
    queryKey: ['payment-voucher', voucherId],
    queryFn: () => paymentVouchersService.getPaymentVoucherById(voucherId),
  });

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      check: 'شيك',
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return null;
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payment-voucher-print-content,
          #payment-voucher-print-content * {
            visibility: visible;
          }
          #payment-voucher-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="no-print flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">طباعة سند الصرف</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div id="payment-voucher-print-content" className="p-8" dir="rtl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">سند صرف</h1>
              <p className="text-gray-600">Payment Voucher</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="font-semibold text-gray-700">رقم السند:</span>
                  <span className="text-gray-900">{voucher.voucher_number}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="font-semibold text-gray-700">التاريخ:</span>
                  <span className="text-gray-900">
                    {new Date(voucher.voucher_date).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="font-semibold text-gray-700">طريقة الدفع:</span>
                  <span className="text-gray-900">{getPaymentMethodLabel(voucher.payment_method)}</span>
                </div>
                {voucher.reference_number && (
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="font-semibold text-gray-700">رقم المرجع:</span>
                    <span className="text-gray-900">{voucher.reference_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المستلم:</p>
                  <p className="text-xl font-bold text-gray-900">{voucher.paid_to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المبلغ:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {voucher.amount?.toLocaleString('ar-IQ')} IQD
                  </p>
                </div>
              </div>

              {voucher.account && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">الحساب:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {voucher.account.code} - {voucher.account.name_ar}
                  </p>
                </div>
              )}

              {voucher.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">الوصف:</p>
                  <p className="text-gray-900">{voucher.description}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                  <p className="font-semibold text-gray-700">المستلم</p>
                  <p className="text-sm text-gray-500">Receiver</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                  <p className="font-semibold text-gray-700">المحاسب</p>
                  <p className="text-sm text-gray-500">Accountant</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                  <p className="font-semibold text-gray-700">المدير المالي</p>
                  <p className="text-sm text-gray-500">Financial Manager</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>تم الإنشاء بواسطة: {voucher.creator?.full_name}</p>
              {voucher.approved_by && (
                <p>تمت الموافقة بواسطة: {voucher.approver?.full_name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
