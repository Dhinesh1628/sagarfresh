import React, { useState, useEffect } from 'react';
import { Wallet, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Cooler, CoolerReturn } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const CoolerReturnsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [coolers, setCoolers] = useState<Cooler[]>([]);
  const [returns, setReturns] = useState<CoolerReturn[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCooler, setSelectedCooler] = useState<Cooler | null>(null);
  const [pickupSlot, setPickupSlot] = useState('Tomorrow Morning, 7:00 AM - 10:00 AM');
  const [refundPreference, setRefundPreference] = useState<'wallet' | 'upi'>('wallet');
  const [upiId, setUpiId] = useState(user?.upiId || 'pooja@okhdfcbank');
  const [returnNotes, setReturnNotes] = useState('Box with gel bricks kept at building security gate.');
  const [pickupAddress, setPickupAddress] = useState(user?.address || 'Flat 402, Alpine Eco Apartments, Doddanekkundi, Bengaluru');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchCoolers = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCoolers();
      setCoolers(data.coolers);
      setReturns(data.returns);
    } catch (err) {
      console.error('Failed to load cooler inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoolers();
  }, [user]);

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCooler) return;

    setSubmittingReturn(true);
    try {
      await api.requestCoolerReturn({
        coolerId: selectedCooler.id,
        pickupSlot,
        notes: returnNotes,
        address: pickupAddress,
        upiId: refundPreference === 'upi' ? upiId : undefined,
        refundPreference
      } as any);

      setSelectedCooler(null);
      if (refundPreference === 'wallet') {
        setNotice(`Doorstep pickup confirmed for box ${selectedCooler.id}. ₹250 will be credited directly to your GoMeat Wallet in 0 seconds once inspected!`);
      } else {
        setNotice(`Doorstep pickup confirmed for box ${selectedCooler.id}. ₹250 will be refunded to your UPI (${upiId}) upon courier scan.`);
      }
      await fetchCoolers();
      await refreshUser();
      setTimeout(() => setNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to request return');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const totalHeld = coolers.length;
  const depositTotal = totalHeld * 250;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h1 className="text-base font-extrabold text-gray-900 dark:text-white">Return Cold Boxes for ₹250 Refund</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your order comes in a reusable cold box. Return the box after delivery and get ₹250 back once it's checked.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          {notice}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-gray-500 dark:text-gray-400 block">Security Deposit in Custody</span>
          <div className="text-xl font-extrabold text-[#d11243] dark:text-rose-500 mt-1">₹{depositTotal}</div>
          <span className="text-gray-400 dark:text-gray-500 text-[11px]">₹250 per box currently held</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-gray-500 dark:text-gray-400 block">Cold Boxes with You</span>
          <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{totalHeld} Units</div>
          <span className="text-gray-400 dark:text-gray-500 text-[11px]">Eligible for 1-click doorstep collection</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-gray-500 dark:text-gray-400 block">Thermocol Boxes Eliminated</span>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{Math.max(14, totalHeld * 3)} Boxes</div>
          <span className="text-gray-400 dark:text-gray-500 text-[11px]">Multi-trip food-grade EPP loop</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Active Boxes */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Boxes in Your Custody ({coolers.length})
            </h3>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">₹250 / box</span>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-xs text-gray-400">
              Loading cooler box inventory...
            </div>
          ) : coolers.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-500 dark:text-gray-400 text-center">
              You currently have no cold boxes in your possession. Boxes are automatically tagged when you place fresh meat orders.
            </div>
          ) : (
            <div className="space-y-3">
              {coolers.map((cooler) => {
                const isPending = cooler.status === 'return_requested';
                return (
                  <div
                    key={cooler.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl space-y-3 text-xs shadow-2xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono text-sm">{cooler.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPending 
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {isPending ? 'Collection Scheduled' : 'At Your Residence'}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{cooler.model}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] block font-medium">Refundable:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">₹{cooler.depositAmount}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      <div>
                        <span className="text-gray-400 dark:text-gray-500 block">QR Serial:</span>
                        <span className="font-mono">{cooler.qrCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500 block">Lifecycle Trips:</span>
                        <span>{cooler.cyclesUsed} round trips</span>
                      </div>
                    </div>

                    <div className="pt-1 flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Assigned: {cooler.assignedHub}
                      </span>

                      {!isPending ? (
                        <button
                          onClick={() => setSelectedCooler(cooler)}
                          className="px-3.5 py-1.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition"
                        >
                          Request Return (₹250)
                        </button>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold">
                          Pickup executive assigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Return History */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Return Requests & UPI Refunds
            </h3>
          </div>

          {returns.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-500 dark:text-gray-400 text-center">
              No return requests on file. When you request a pickup, the status will show here.
            </div>
          ) : (
            <div className="space-y-3">
              {returns.map((ret) => {
                const isRefunded = ret.status === 'refunded';
                return (
                  <div
                    key={ret.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl space-y-2 text-xs shadow-2xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 dark:text-white">{ret.id}</span>
                        <span className="font-mono text-gray-500 dark:text-gray-400">({ret.coolerId})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRefunded ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                      }`}>
                        {ret.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5">
                      <div>Pickup Window: <strong className="text-gray-900 dark:text-white">{ret.scheduledPickupSlot}</strong></div>
                      <div>Collection Address: <span>{ret.userAddress}</span></div>
                      <div>UPI Reversal: <strong className="text-[#d11243] dark:text-rose-400">{ret.refundMode}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 dark:text-gray-400">Agent: {ret.courierAssigned || 'Local Hub Partner'}</span>
                      <span className={`font-bold ${isRefunded ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {isRefunded ? '+₹250 Credited to UPI' : '₹250 Pending Collection Scan'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Simple step card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2 shadow-2xs">
            <h4 className="font-bold text-gray-900 dark:text-white">How to Return Your Cold Box</h4>
            <ol className="list-decimal pl-4 space-y-1 text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              <li>Take your meat cuts out and keep them in your fridge.</li>
              <li>Keep the ice packs inside the cold box.</li>
              <li>Hand the box back to the delivery partner on your next order, or request a pickup.</li>
              <li>Get ₹250 back to your GoMeat Wallet or bank account once it's checked!</li>
            </ol>
          </div>

        </div>

      </div>

      {/* Return Scheduling Modal */}
      {selectedCooler && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedCooler(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 text-gray-800 dark:text-gray-100 z-10 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Schedule Box Pickup</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[11px]">Box Tag: <span className="font-mono text-[#d11243] dark:text-rose-400 font-bold">{selectedCooler.id}</span></p>
              </div>
              <button onClick={() => setSelectedCooler(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
            </div>

            <form onSubmit={handleRequestReturn} className="space-y-3">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Pickup Address</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              {/* Refund Method Options */}
              <div className="space-y-2">
                <label className="block text-gray-800 dark:text-gray-200 font-bold text-xs">
                  How would you like to receive your ₹250 refund?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* Option 1: GoMeat In-App Wallet */}
                  <div
                    onClick={() => setRefundPreference('wallet')}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left flex items-start gap-2.5 ${
                      refundPreference === 'wallet'
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={refundPreference === 'wallet'}
                        onChange={() => setRefundPreference('wallet')}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>GoMeat In-App Wallet</span>
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded">
                          0 Seconds • Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                        Credited directly into your GoMeat app balance in 0 seconds. Ready to use on your next order.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: UPI / Bank Account */}
                  <div
                    onClick={() => setRefundPreference('upi')}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left flex items-start gap-2.5 ${
                      refundPreference === 'upi'
                        ? 'border-[#d11243] bg-rose-50/80 dark:bg-rose-950/40 ring-1 ring-[#d11243]'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={refundPreference === 'upi'}
                        onChange={() => setRefundPreference('upi')}
                        className="text-[#d11243] focus:ring-[#d11243] cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#d11243]" />
                          <span>Direct UPI / Bank Transfer</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          Direct to Bank
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                        ₹250 sent to your Google Pay, PhonePe, Paytm, or Bank Account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show UPI Input when Option 2 is chosen */}
                {refundPreference === 'upi' && (
                  <div className="pt-1.5">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1 text-[11px]">
                      Enter UPI ID for ₹250 Bank Transfer *
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243] text-xs font-medium"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Pickup Window</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                >
                  <option value="Tomorrow Morning, 7:00 AM - 10:00 AM">Tomorrow Morning, 7:00 AM - 10:00 AM</option>
                  <option value="Tomorrow Evening, 5:00 PM - 8:00 PM">Tomorrow Evening, 5:00 PM - 8:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Gate / Drop Instructions</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/40 rounded-lg border border-rose-100 dark:border-rose-900/50 flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-gray-200">Refund Amount:</span>
                <span className="font-black text-[#d11243] dark:text-rose-400 text-sm">₹{selectedCooler.depositAmount}</span>
              </div>

              <button
                type="submit"
                disabled={submittingReturn}
                className="w-full py-2.5 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs cursor-pointer shadow-xs transition"
              >
                {submittingReturn ? 'Logging Pickup...' : 'Confirm Doorstep Collection'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
