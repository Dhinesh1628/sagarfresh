import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  type: 'tos' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/75" />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 text-slate-200 z-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">
            {type === 'tos' ? 'Terms of Service - GoMeat India' : 'Privacy Policy - GoMeat India'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'tos' ? (
          <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
            <p>
              <strong>1. Reusable Cold Box Deposit Policy:</strong> Each perishable delivery is packaged inside a sanitized reusable insulated EPP box containing phase-change ice gel bricks. A refundable deposit of ₹250 is collected at checkout. This deposit remains your property held in trust.
            </p>
            <p>
              <strong>2. Deposit Refund Process:</strong> When you request a return through the portal or app, our delivery executive collects the empty box and gel packs from your address. Upon collection scan, ₹250 is credited back via UPI (Google Pay, PhonePe, Paytm) or original payment method within 2 hours.
            </p>
            <p>
              <strong>3. Freshness & Cold-Chain SLA:</strong> All coastal fish and meats are dispatched in ice-slurry or chilled temperature ranges between 0°C and 3°C. In the event of cold-chain breakage or packaging compromise, customers are entitled to an immediate replacement or full refund under our FSSAI food safety compliance.
            </p>
            <p>
              <strong>4. Order Cancellations & Delivery Slots:</strong> Morning orders (7:00 AM – 9:00 AM) can be rescheduled up to 10:00 PM the previous evening. Evening orders can be modified up to 2:00 PM on the delivery date.
            </p>
            <p>
              <strong>5. Governing Law:</strong> These terms are governed by the laws of India, under the jurisdiction of courts in Bengaluru, Karnataka.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
            <p>
              <strong>1. Information Collection:</strong> We collect your name, delivery address, contact number, and UPI ID solely for order fulfillment, dispatch communication, and cooler deposit refunds.
            </p>
            <p>
              <strong>2. Data Usage:</strong> Your delivery coordinates are shared only with the assigned local delivery partner (e.g. EV delivery executives in Bengaluru, Mumbai, or Hyderabad) to complete your drop-off.
            </p>
            <p>
              <strong>3. Payment Security:</strong> We do not store debit/credit card numbers or UPI PINs. Transactions are processed through RBI-licensed payment gateways.
            </p>
            <p>
              <strong>4. Account Deletion & Rights:</strong> Under the Digital Personal Data Protection Act (DPDP), you can request complete erasure of your profile and address history by contacting support@gomeat.in.
            </p>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
