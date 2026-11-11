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
  Scissors
} from 'lucide-react';
import { api } from '../api';
import type { Order } from '../types';

export const ButcherStationPage: React.FC = () => {
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

  // Available Harbor / Pasture Raw Meat Batches (FSSAI Traceability)
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

  // Load orders
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

  // Filter orders by stage
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PENDING'
  );
  const inPrepOrders = orders.filter(
    (o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'QUALITY_CHECK'
  );
  const packedOrders = orders.filter(
    (o) => o.orderStatus === 'PACKED' || o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'DELIVERED'
  );

  // Open Butcher Prep Terminal for an order
  const handleStartButchering = (order: Order) => {
    setSelectedOrder(order);
    
    // Estimate target grams from first item
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
    setWeighedGrams(target - Math.floor(Math.random() * 8) + 2); // realistic scale readout
    setColdBoxId(order.coolerId || `BOX-BLR-${Math.floor(100 + Math.random() * 900)}`);
    setFreshSealTag(`FS-${Math.floor(10000 + Math.random() * 90000)}`);
    setLiveTemp(1.2);
    setPrintSuccess(false);

    // Pick matching batch by category/name
    const nameLower = (firstItem?.name || '').toLowerCase();
    if (nameLower.includes('mutton')) setSelectedBatch('LOT-MUTTON-BLR-892');
    else if (nameLower.includes('prawn')) setSelectedBatch('LOT-PRAWNS-CR-112');
    else if (nameLower.includes('chicken')) setSelectedBatch('LOT-CHICKEN-FARM-201');
    else setSelectedBatch('LOT-SURMAI-0400AM-MNG');
  };

  // Weight tolerance calculation
  const weightDiff = weighedGrams - targetGrams;
  const weightPercent = ((weightDiff / targetGrams) * 100).toFixed(1);
  const isWithinTolerance = Math.abs(parseFloat(weightPercent)) <= 5.0; // FSSAI ±5% rule

  // Complete Butcher Prep and Dispatch to Packed
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

  // Simulated ESC/POS Thermal Label Print
  const handlePrintLabel = () => {
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 text-gray-900 dark:text-gray-100 font-sans">
      
      {/* Butcher KDS Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d11243] to-rose-700 flex items-center justify-center font-black text-2xl text-white shadow-lg">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">Butcher Station KDS</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  COLD ROOM #2
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  0°C–4°C TELEMETRY
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Master Carver: <strong>Irfan Butcher</strong> (Station #BTC-14) • Bengaluru Central Depot
              </p>
            </div>
          </div>

          {/* Quick Hub Telemetry Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Room Temp</span>
              <span className="text-sm font-black text-emerald-400 font-mono">1.4°C Chilled</span>
            </div>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">FSSAI Lic.</span>
              <span className="text-xs font-mono font-bold text-gray-300">#11224333000491</span>
            </div>
            <button
              onClick={loadOrders}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gray-300 transition cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KDS Pipeline Summary Strip */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-center">
          <div 
            onClick={() => setActiveStage('pending')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              activeStage === 'pending'
                ? 'bg-rose-950/60 border-[#d11243] text-rose-300'
                : 'bg-slate-800/40 border-slate-700/60 text-gray-400 hover:bg-slate-800/70'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">Pending Cuts</span>
            <span className="text-xl font-black text-white">{pendingOrders.length}</span>
          </div>

          <div 
            onClick={() => setActiveStage('preparing')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              activeStage === 'preparing'
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-slate-800/40 border-slate-700/60 text-gray-400 hover:bg-slate-800/70'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">On Cutting Block</span>
            <span className="text-xl font-black text-amber-400">{inPrepOrders.length}</span>
          </div>

          <div 
            onClick={() => setActiveStage('packed')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              activeStage === 'packed'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/40 border-slate-700/60 text-gray-400 hover:bg-slate-800/70'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">Packed & Dispatched</span>
            <span className="text-xl font-black text-emerald-400">{packedOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Main KDS Board: Orders Column */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
          <div className="animate-spin w-8 h-8 border-3 border-[#d11243] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-bold">Synchronizing cutting queue with GoMeat dark hub...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeStage === 'pending' ? pendingOrders : activeStage === 'preparing' ? inPrepOrders : packedOrders).map((ord) => (
            <div
              key={ord.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-gray-200 dark:border-slate-800 shadow-sm hover:border-[#d11243] transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-gray-950 dark:text-white">
                        #{ord.orderNumber || ord.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 text-[10px] font-black">
                        {ord.orderStatus || 'CONFIRMED'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Customer: {ord.customerName} • {ord.city}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-gray-400">
                    Box: {ord.coolerId}
                  </span>
                </div>

                {/* Items & Specific Cut Requests */}
                <div className="bg-gray-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-black block">
                    Customer Cut Specifications
                  </span>
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <div className="font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                          {item.netWeight || item.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#d11243] dark:text-rose-400 font-bold flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        <span>Style: {item.cutStyle || 'Curry Cut (Medium Bone-in)'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Existing Prep Notes / Batch ID if already processed */}
                {ord.batchLotId && (
                  <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 p-2 rounded-xl">
                    <div>Batch: <strong>{ord.batchLotId}</strong></div>
                    <div>FreshSeal Tag: <strong>#{ord.sealTag || 'FS-101'}</strong></div>
                    <div>Weighed: <strong>{ord.weighedWeight || '500g'}</strong></div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => handleStartButchering(ord)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-gray-900 to-black dark:from-slate-800 dark:to-slate-700 hover:from-[#d11243] hover:to-[#b80f3b] text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
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

      {/* ========================================================= */}
      {/* BUTCHER PREP & SCALE CALIBRATION TERMINAL MODAL           */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 text-[10px] font-black">
                    CUTTING BLOCK & COLD PREP
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950 dark:text-white mt-1">
                  Weigh, Tag Batch & Seal ThermalVault
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CUTTING INSTRUCTION SUMMARY */}
            <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs">
              <span className="text-[10px] font-black text-[#d11243] uppercase tracking-wider block">
                Target Cut
              </span>
              <div className="font-extrabold text-gray-900 dark:text-white text-sm mt-0.5">
                {selectedOrder.items[0]?.name} • Cut Style: {selectedOrder.items[0]?.cutStyle || 'Curry Cut'}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                Trim excess fat, bone-in medium pieces, wash in chilled reverse-osmosis water (0°C–2°C), vacuum seal immediately.
              </p>
            </div>

            {/* FEATURE 1: DIGITAL SCALE WEIGHING & ±5% TOLERANCE CHECK */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#d11243]" />
                  <span>1. Digital Kitchen Scale Calibration</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  isWithinTolerance
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}>
                  {isWithinTolerance ? '✓ Within FSSAI ±5% Tolerance' : '⚠️ Tolerance Exceeded'}
                </span>
              </div>

              {/* Scale Readout & Quick Steppers */}
              <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Net Weight</span>
                  <span className="text-lg font-black text-gray-700 dark:text-gray-300 font-mono">{targetGrams}g</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Scale Live Weight</span>
                  <div className="text-3xl font-black font-mono text-[#d11243] dark:text-rose-400">
                    {weighedGrams}g
                  </div>
                  <span className={`text-[11px] font-bold ${isWithinTolerance ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {weightDiff >= 0 ? `+${weightDiff}g` : `${weightDiff}g`} ({weightPercent}%)
                  </span>
                </div>

                {/* Micro Adjust Steppers */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWeighedGrams(g => Math.max(100, g - 5))}
                    className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-sm cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeighedGrams(g => g + 5)}
                    className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-sm cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURE 2: HARBOR & PASTURE BATCH TRACEABILITY (FSSAI RULE) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Harbor / Pasture Raw Stock Batch Traceability</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rawBatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBatch(b.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      selectedBatch === b.id
                        ? 'bg-rose-50/70 dark:bg-rose-950/50 border-[#d11243] ring-1 ring-[#d11243]'
                        : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#d11243] dark:text-rose-400">{b.id}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{b.temp}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1 font-semibold">{b.label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">{b.origin} • {b.catchTime}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURE 3: THERMALVAULT BOX PAIRING & FRESHSEAL LOCK */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                <span>3. ThermalVault™ Box Pairing & FreshSeal Tamper Tag</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-[10px] text-sky-900 dark:text-sky-300 font-bold block mb-1">Cold Box ID</span>
                  <input
                    type="text"
                    value={coldBoxId}
                    onChange={(e) => setColdBoxId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-sky-900 dark:text-sky-300 font-bold block mb-1">FreshSeal Tag #</span>
                  <input
                    type="text"
                    value={freshSealTag}
                    onChange={(e) => setFreshSealTag(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-sky-900 dark:text-sky-300 font-bold block mb-1">Gel Brick Temp</span>
                  <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{liveTemp}°C (Safe)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE 4: 1-CLICK THERMAL POUCH LABEL PREVIEW & PRINT */}
            <div className="p-4 rounded-2xl bg-gray-900 text-white border border-gray-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs uppercase font-bold text-gray-300 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-[#d11243]" />
                  <span>4. ESC/POS Thermal Sticker Preview</span>
                </span>
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="px-3 py-1 bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>{printSuccess ? 'Printed! ✓' : 'Print Label'}</span>
                </button>
              </div>

              {/* Realistic ESC/POS Thermal Sticker */}
              <div className="bg-white text-black p-4 rounded-xl text-[11px] leading-tight space-y-1.5 max-w-sm mx-auto shadow-md">
                <div className="text-center border-b border-dashed border-gray-400 pb-1">
                  <div className="font-black text-sm">GOMEAT FRESH COLD-CHAIN</div>
                  <div className="text-[9px] text-gray-600">FSSAI Central Lic. No: 11224333000491</div>
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
                  <span>PACKED AT:</span>
                  <span>{new Date().toLocaleTimeString()} (Today)</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>USE BY:</span>
                  <span>+48 Hours (Keep Chilled 0°C–4°C)</span>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-gray-400">
                  <div className="font-mono tracking-widest text-xs font-black">||| | ||||| || |||| |||</div>
                  <div className="text-[8px] text-gray-500">*{selectedOrder.id}-{freshSealTag}*</div>
                </div>
              </div>
            </div>

            {/* FINAL ACTION: COMPLETE BUTCHERING & DISPATCH */}
            <button
              type="button"
              disabled={isPacking}
              onClick={handleCompletePrep}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              {isPacking ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Sealing Fresh ThermalVault & Dispatching...</span>
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
