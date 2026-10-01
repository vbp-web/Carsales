import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  customerName: string;
  customerEmail: string;
  onSuccess: (paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; method: string }) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  customerName,
  customerEmail,
  onSuccess,
  onClose
}) => {
  const { error } = useToast();
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    try {
      setProcessing(true);

      // Step 1: Request Razorpay Order Creation from Backend
      const orderInit = await api.payments.createOrder(amount);
      const razorpayOrderId = orderInit.orderId;

      // Step 2: Simulate Razorpay authorization and signature generation
      const razorpayPaymentId = 'pay_' + Math.random().toString(36).slice(2, 14);
      const razorpaySignature = 'sig_test_verified_' + Math.random().toString(36).slice(2, 16);

      // Step 3: Backend signature verification
      const verifyRes = await api.payments.verify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });

      if (verifyRes.verified) {
        let paymentMethodLabel = 'Razorpay UPI';
        if (activeTab === 'card') paymentMethodLabel = 'Razorpay Credit Card';
        if (activeTab === 'netbanking') paymentMethodLabel = `Razorpay Net Banking (${selectedBank})`;

        onSuccess({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          method: paymentMethodLabel
        });
      } else {
        throw new Error('Payment verification failed on server.');
      }
    } catch (err: any) {
      error('Transaction Failed', err.message || 'Payment could not be authorized.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors max-h-[90vh] overflow-y-auto">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm tracking-tighter">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide">Razorpay Trusted Checkout</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">AutoApex Automotive Technologies</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-blue-300 block">Total Payable</span>
            <span className="text-base font-bold text-white tabular-nums">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-900/70 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upi' ? 'text-zinc-950 dark:text-white border-b-2 border-red-600 bg-white dark:bg-zinc-900 font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI / QR</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'card' ? 'text-zinc-950 dark:text-white border-b-2 border-red-600 bg-white dark:bg-zinc-900 font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'netbanking' ? 'text-zinc-950 dark:text-white border-b-2 border-red-600 bg-white dark:bg-zinc-900 font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Method Panels */}
        <div className="p-4 sm:p-6 space-y-4">
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                  <div
                    key={app}
                    className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-center hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-300 block">{app}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Instant</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Enter UPI VPA / ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block">Select Your Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      selectedBank === b
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-white font-semibold'
                        : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>256-bit SSL Cryptographic Bank Encryption</span>
            </div>
            <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-850 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-full sm:w-auto text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Signature...</span>
              </>
            ) : (
              <>
                <span>Authorize & Pay ₹{amount.toLocaleString()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
