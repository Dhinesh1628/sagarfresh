import React, { useState, useEffect } from 'react';
import { 
  Beef, 
  Scale, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Thermometer, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Package, 
  RefreshCw, 
  ChevronRight,
  Sliders,
  Scissors,
  Store,
  ArrowLeft,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../api';
import type { Order } from '../types';

interface ButcherStationPageProps {
  onBackToStore?: () => void;
}

export const ButcherStationPage: React.FC<ButcherStationPageProps> = ({ onBackToStore }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<'pending' | 'preparing' | 'packed'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Active Butcher Prep Terminal State
  const [weighedGrams, setWeighedGrams] = useState<number>(495);
  const [targetGrams, setTargetGrams] = useState<number>(500);
  const [selectedBatch, setSelectedBatch] = useState<string>('LOT-SURMAI-0400AM-MNG');
  const [coldBoxId, setColdBoxId] = useState<string>('BOX-BLR-417');
  const [freshSealTag, setFreshSealTag] = useState<string>('FS-89412');
  const [liveTemp, setLiveTemp] = useState<number>(1.2);
  const [isPacking, setIsPacking] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker for kitchen terminal
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rawBatches = [
    {
      id: 'LOT-SURMAI-0400AM-MNG',
      label: 'Surmai / Kingfish — Mangalore Old Port Daily Catch',
      origin: 'Deep Coastal Waters of Karnataka (Vessel #IND-KA-092)',
      catchTime: '04:00 AM Today',
      temp: '0.8°C'
    },
    {
      id: 'LOT-MUTTON-BLR-892',
      label: 'Free-Range Goat — Devanahalli Pasture Raised',
      origin: 'Pasture Raised, 100% Halal Hand-Cut & Chilled',
      catchTime: '05:30 AM Today',
      temp: '1.4°C'
    },
    {
      id: 'LOT-CHICKEN-FARM-201',
      label: 'Free-Range Chicken — Nelamangala Organic Farm',
      origin: 'Hormone-Free Free-Range Broiler Batch #201',
      catchTime: '06:00 AM Today',
      temp: '1.1°C'
    },
    {
      id: 'LOT-PRAWNS-CR-112',
      label: 'Sea Tiger Prawns — Karwar Deep Estuary',
      origin: 'Wild Sea Catch, Deveined at Harbor Cold Deck',
      catchTime: '03:45 AM Today',
      temp: '0.6°C'
    }
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders for butcher station:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PENDING'
  );
  const inPrepOrders = orders.filter(
    (o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'QUALITY_CHECK'
  );
  const packedOrders = orders.filter(
    (o) => o.orderStatus === 'PACKED' || o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'DELIVERED'
  );

  const handleStartButchering = (order: Order) => {
    setSelectedOrder(order);
    
    const firstItem = order.items[0];
    let target = 500;
    if (firstItem?.netWeight?.includes('1kg') || firstItem?.netWeight?.includes('1000g')) {
      target = 1000;
    } else if (firstItem?.netWeight?.includes('800g')) {
      target = 800;
    } else if (firstItem?.netWeight?.includes('250g')) {
      target = 250;
    }
    setTargetGrams(target);
    setWeighedGrams(target - Math.floor(Math.random() * 8) + 2);
    setColdBoxId(order.coolerId || `BOX-BLR-${Math.floor(100 + Math.random() * 900)}`);
    setFreshSealTag(`FS-${Math.floor(10000 + Math.random() * 90000)}`);
    setLiveTemp(1.2);
    setPrintSuccess(false);

    const nameLower = (firstItem?.name || '').toLowerCase();
    if (nameLower.includes('mutton')) setSelectedBatch('LOT-MUTTON-BLR-892');
    else if (nameLower.includes('prawn')) setSelectedBatch('LOT-PRAWNS-CR-112');
    else if (nameLower.includes('chicken')) setSelectedBatch('LOT-CHICKEN-FARM-201');
    else setSelectedBatch('LOT-SURMAI-0400AM-MNG');
  };

  const weightDiff = weighedGrams - targetGrams;
  const weightPercent = ((weightDiff / targetGrams) * 100).toFixed(1);
  const isWithinTolerance = Math.abs(parseFloat(weightPercent)) <= 5.0;

  const handleCompletePrep = async () => {
    if (!selectedOrder) return;
    try {
      setIsPacking(true);
      const updated = await api.completeButcherPrep(selectedOrder.id, {
        weighedWeight: `${weighedGrams}g`,
        batchLotId: selectedBatch,
        sealTag: freshSealTag,
        coolerId: coldBoxId,
        butcherName: 'Irfan Butcher (Master Carver #BTC-14)',
        liveTemp
      });

      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      alert(`✓ Order #${selectedOrder.orderNumber || selectedOrder.id} successfully cut, vacuum sealed, and paired with ThermalVault #${coldBoxId}. Transferred to Delivery Dispatch Queue!`);
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.message || 'Failed to complete butcher preparation');
    } finally {
      setIsPacking(false);
    }
  };

  const handlePrintLabel = () => {
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
      
      {/* ========================================================= */}
      {/* DEDICATED KDS TERMINAL TOP BAR                            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d11243] to-rose-700 flex items-center justify-center font-black text-xl text-white shadow-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-white tracking-tight">GoMeat Butcher KDS</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  STATION #BTC-14
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  COLD ROOM: 1.4°C
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Master Carver: Irfan Butcher • FSSAI Lic #11224333000491</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentTime}</span>
            </div>

            {onBackToStore && (
              <button
                onClick={onBackToStore}
                title="Return to GoMeat Customer Store"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Store className="w-4 h-4 text-rose-400" />
                <span>Store</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN KDS WORKSPACE                                        */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        
        {/* Stage Switcher Strip */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div 
            onClick={() => setActiveStage('pending')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              activeStage === 'pending'
                ? 'bg-rose-950/60 border-[#d11243] text-rose-300 shadow-md ring-1 ring-[#d11243]'
                : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:bg-slate-900'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">1. Pending Cuts</span>
            <span className="text-2xl font-black text-white">{pendingOrders.length}</span>
          </div>

          <div 
            onClick={() => setActiveStage('preparing')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              activeStage === 'preparing'
                ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:bg-slate-900'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">2. On Cutting Block</span>
            <span className="text-2xl font-black text-amber-400">{inPrepOrders.length}</span>
          </div>

          <div 
            onClick={() => setActiveStage('packed')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              activeStage === 'packed'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:bg-slate-900'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">3. Packed & Sealed</span>
            <span className="text-2xl font-black text-emerald-400">{packedOrders.length}</span>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800">
            <div className="animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs text-gray-400">Loading dark store tickets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeStage === 'pending' ? pendingOrders : activeStage === 'preparing' ? inPrepOrders : packedOrders).map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-sm hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white">
                          #{ord.orderNumber || ord.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-black border border-rose-900">
                          {ord.orderStatus || 'CONFIRMED'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {ord.customerName} • {ord.city}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-gray-400">
                      Box: {ord.coolerId}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">
                      Customer Cut Specs
                    </span>
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <div className="font-extrabold text-white flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="font-mono text-emerald-400 font-black">
                            {item.netWeight || item.unit}
                          </span>
                        </div>
                        <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          <span>Style: {item.cutStyle || 'Curry Cut (Medium Bone-in)'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ord.batchLotId && (
                    <div className="text-[10px] font-mono text-gray-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>Batch: <strong className="text-white">{ord.batchLotId}</strong></div>
                      <div>FreshSeal: <strong className="text-white">#{ord.sealTag || 'FS-101'}</strong></div>
                      <div>Weighed: <strong className="text-emerald-400">{ord.weighedWeight || '500g'}</strong></div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleStartButchering(ord)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-[#d11243] hover:from-rose-700 hover:to-[#b80f3b] text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>
                      {ord.orderStatus === 'PACKED' ? 'Inspect Label & Batch' : 'Open Cutting & Scale Terminal'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* BUTCHER PREP & CALIBRATION MODAL                          */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-black border border-rose-900">
                  CUTTING BLOCK TERMINAL
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Weigh, Tag Batch & Seal ThermalVault
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scale Calibration */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-rose-400" />
                  <span>1. Digital Kitchen Scale Calibration</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  isWithinTolerance
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-950 text-red-300 border-red-500'
                }`}>
                  {isWithinTolerance ? '✓ Within FSSAI ±5% Tolerance' : '⚠️ Tolerance Exceeded'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Net Weight</span>
                  <span className="text-lg font-black text-gray-200 font-mono">{targetGrams}g</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Scale Live Readout</span>
                  <div className="text-3xl font-black font-mono text-rose-400">
                    {weighedGrams}g
                  </div>
                  <span className={`text-[11px] font-bold ${isWithinTolerance ? 'text-emerald-400' : 'text-red-400'}`}>
                    {weightDiff >= 0 ? `+${weightDiff}g` : `${weightDiff}g`} ({weightPercent}%)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeighedGrams(g => Math.max(100, g - 5))}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => setWeighedGrams(g => g + 5)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Traceability */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Harbor / Pasture Raw Stock Batch Traceability</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rawBatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBatch(b.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      selectedBatch === b.id
                        ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-white flex items-center justify-between">
                      <span className="font-mono text-[11px] text-rose-400">{b.id}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{b.temp}</span>
                    </div>
                    <p className="text-[11px] text-gray-200 mt-1 font-semibold">{b.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{b.origin} • {b.catchTime}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thermal Box & FreshSeal */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>3. ThermalVault™ Box Pairing & FreshSeal Tamper Tag</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Cold Box ID</span>
                  <input
                    type="text"
                    value={coldBoxId}
                    onChange={(e) => setColdBoxId(e.target.value)}
                    className="w-full bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">FreshSeal Tag #</span>
                  <input
                    type="text"
                    value={freshSealTag}
                    onChange={(e) => setFreshSealTag(e.target.value)}
                    className="w-full bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Gel Temp</span>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{liveTemp}°C (Chilled)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ESC/POS Print */}
            <div className="p-4 rounded-2xl bg-black border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs uppercase font-bold text-gray-300 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-rose-400" />
                  <span>4. ESC/POS Thermal Sticker Preview</span>
                </span>
                <button
                  onClick={handlePrintLabel}
                  className="px-3 py-1 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>{printSuccess ? 'Printed! ✓' : 'Print Label'}</span>
                </button>
              </div>

              <div className="bg-white text-black p-4 rounded-xl text-[11px] leading-tight space-y-1.5 max-w-sm mx-auto shadow-md">
                <div className="text-center border-b border-dashed border-gray-400 pb-1">
                  <div className="font-black text-sm">GOMEAT FRESH COLD-CHAIN</div>
                  <div className="text-[9px] text-gray-600">FSSAI Lic. #11224333000491</div>
                </div>

                <div className="flex justify-between font-bold pt-1">
                  <span>ITEM:</span>
                  <span className="text-right">{selectedOrder.items[0]?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>STYLE:</span>
                  <span>{selectedOrder.items[0]?.cutStyle || 'Curry Cut'}</span>
                </div>
                <div className="flex justify-between text-base font-black">
                  <span>NET WEIGHT:</span>
                  <span>{weighedGrams}g (Net)</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>BATCH / LOT:</span>
                  <span>{selectedBatch}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>FRESHSEAL #:</span>
                  <span>{freshSealTag}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>USE BY:</span>
                  <span>+48 Hours (Keep Chilled 0°C–4°C)</span>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-gray-400">
                  <div className="font-mono tracking-widest text-xs font-black">||| | ||||| || |||| |||</div>
                </div>
              </div>
            </div>

            <button
              disabled={isPacking}
              onClick={handleCompletePrep}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              {isPacking ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Sealing ThermalVault & Dispatching...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Cut & Packed &rarr; Send to Delivery Courier</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
