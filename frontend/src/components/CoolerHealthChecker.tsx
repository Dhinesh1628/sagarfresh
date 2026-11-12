import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Thermometer, Clock, RotateCcw, 
  Search, AlertTriangle, CheckCircle2, XCircle, RefreshCw, 
  Sparkles, Wrench, Ban, QrCode, Camera, Info, ArrowUpRight,
  TrendingDown, Check, Activity, BatteryMedium, Cpu
} from 'lucide-react';
import { api } from '../api';
import type { CoolerHealthReport, FleetHealthOverview } from '../types';

interface CoolerHealthCheckerProps {
  initialQr?: string;
  onOpenScanner?: () => void;
  className?: string;
}

export const CoolerHealthChecker: React.FC<CoolerHealthCheckerProps> = ({
  initialQr = 'GOMEAT-BOX-BLR-417',
  onOpenScanner,
  className = ''
}) => {
  const [searchQr, setSearchQr] = useState(initialQr);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CoolerHealthReport | null>(null);
  const [overview, setOverview] = useState<FleetHealthOverview | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const sampleBoxes = [
    { id: 'BOX-BLR-417', qr: 'GOMEAT-BOX-BLR-417', label: 'BOX-417 (Standard Delivery)', grade: 'A' },
    { id: 'BOX-BLR-103', qr: 'GOMEAT-BOX-BLR-103', label: 'BOX-103 (⚠️ Breach Anomaly)', grade: 'D' },
    { id: 'BOX-BLR-633', qr: 'GOMEAT-BOX-BLR-633', label: 'BOX-633 (Central Depot Stock)', grade: 'A' },
    { id: 'BOX-BLR-182', qr: 'GOMEAT-BOX-BLR-182', label: 'BOX-182 (In-Transit EV)', grade: 'A' },
    { id: 'BOX-BLR-983', qr: 'SAGAR-BOX-BLR-983', label: 'BOX-983 (Available Reserve)', grade: 'A' },
  ];

  const loadOverview = async () => {
    try {
      const data = await api.getCoolerFleetHealth();
      setOverview(data);
    } catch (e: any) {
      console.warn('Could not load fleet overview:', e);
    }
  };

  const runDiagnostic = async (qrToInspect: string) => {
    const q = (qrToInspect || searchQr).trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setActionNotice(null);
    try {
      const data = await api.getCoolerHealthDiagnostic(q);
      setReport(data);
    } catch (err: any) {
      setError(err.message || `No cooler found for QR code '${q}'. Please scan again.`);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    runDiagnostic(initialQr);
  }, []);

  const handleAction = async (action: 'sanitize' | 'flag_damage' | 'decommission' | 'recommission', notes?: string) => {
    if (!report?.cooler?.id) return;
    setActionLoading(true);
    try {
      const res = await api.applyCoolerAction(report.cooler.id, action, notes);
      setActionNotice(res.message || `Action ${action} applied successfully`);
      await runDiagnostic(report.cooler.id);
      await loadOverview();
    } catch (e: any) {
      setError(e.message || 'Failed to update cooler state');
    } finally {
      setActionLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case 'B': return 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800';
      case 'C': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'D': return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Header Banner & Fleet KPI Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-sky-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Script #3 Engine • GoMeat Fleet Telemetry
              </span>
              <span className="text-[10px] text-gray-400">FreshSeal 0°C-4°C SLA</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              Cooler Health & Cold-Chain Compliance Checker
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl mt-0.5">
              Tracks individual cold boxes by QR code for thermal compliance, sensor anomalies, return turnaround latency, and aging lifecycle wear.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Camera QR Scanner</span>
              </button>
            )}
            <button
              onClick={() => { loadOverview(); if (report?.cooler?.id) runDiagnostic(report.cooler.id); }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition cursor-pointer border border-white/20"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overview KPI Mini-Tiles */}
        {overview?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Total Fleet</span>
              <span className="text-lg font-black text-white">{overview.summary.total} Boxes</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">Grade A Optimal</span>
              <span className="text-lg font-black text-emerald-300">{overview.summary.optimal} Active</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-cyan-400 block font-bold uppercase tracking-wider">0°C-4°C Compliant</span>
              <span className="text-lg font-black text-cyan-300">{overview.summary.complianceRatePct}%</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-rose-400 block font-bold uppercase tracking-wider">Thermal Defects</span>
              <span className="text-lg font-black text-rose-300">{overview.summary.tempDefects} Breaches</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Aging Alerts (&gt;15x)</span>
              <span className="text-lg font-black text-amber-300">{overview.summary.agingAlerts} Worn</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-indigo-400 block font-bold uppercase tracking-wider">Avg Return TAT</span>
              <span className="text-lg font-black text-indigo-300">{overview.summary.avgFleetReturnHours}h</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Search & Quick Select Chips */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <form 
          onSubmit={(e) => { e.preventDefault(); runDiagnostic(searchQr); }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQr}
              onChange={(e) => setSearchQr(e.target.value)}
              placeholder="Enter QR Code or Box Tag (e.g. GOMEAT-BOX-BLR-417, BOX-BLR-103, 417)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Run Health Check</span>
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-gray-400" />
            Quick Inspect:
          </span>
          {sampleBoxes.map((box) => (
            <button
              key={box.id}
              onClick={() => { setSearchQr(box.qr); runDiagnostic(box.qr); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                searchQr.toUpperCase().includes(box.id)
                  ? 'bg-sky-500 text-white border-sky-600 shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
              }`}
            >
              <span>{box.label}</span>
              <span className={`px-1 py-0.2 rounded text-[9px] font-black ${
                box.grade === 'A' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
              }`}>
                {box.grade}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Action Notice & Errors */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">Cooler Diagnostic Error</p>
            <p className="text-[11px] opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* 4. Active Cooler Diagnostic View */}
      {report && report.found && (
        <div className="space-y-4">
          {/* Top Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 shrink-0">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black font-mono text-gray-950 dark:text-white">
                      {report.cooler.id}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                      {report.cooler.qrCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      report.cooler.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : report.cooler.status === 'damaged' || report.cooler.status === 'maintenance'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {report.cooler.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                    {report.cooler.model}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Hub: <span className="font-medium text-gray-700 dark:text-gray-300">{report.cooler.assignedHub || 'Bengaluru Central Depot'}</span> • Last Sanitized: <span className="font-medium text-gray-700 dark:text-gray-300">{report.cooler.lastSanitizedDate || 'Recent'}</span>
                  </p>
                </div>
              </div>

              {/* Health Score Pill & Grade */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Fleet Composite Score</span>
                  <span className="text-2xl font-black text-gray-950 dark:text-white">
                    {report.health.score}%
                  </span>
                  <span className="text-[10px] text-gray-400 block font-medium">
                    {report.health.agingStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${getGradeColor(report.health.grade)}`}>
                  {report.health.grade}
                </div>
              </div>
            </div>

            {/* Deductions if any */}
            {report.health.deductions?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-rose-700 dark:text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Health Deductions & Wear Notes:
                </span>
                <ul className="list-disc pl-5 space-y-0.5 text-gray-600 dark:text-gray-400">
                  {report.health.deductions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Grid: Script 1 (Compliance) and Script 2 (Fleet SLA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* CARD 1: Cold Chain Temperature Compliance (compliance_scan.py) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-950 dark:text-white">
                      Cold Chain Temperature Compliance
                    </h4>
                    <span className="text-[10px] text-gray-500">Script #3: compliance_scan.py Logic</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  Range: {report.tempCheck.requiredMin}°C to {report.tempCheck.requiredMax}°C
                </span>
              </div>

              {/* Verdict Banner */}
              <div className={`p-3.5 rounded-xl border ${
                report.tempCheck.verdict.status === 'CORRECT'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}>
                <div className="flex items-start gap-2.5">
                  {report.tempCheck.verdict.status === 'CORRECT' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-black text-xs uppercase tracking-wide">
                      VERDICT: {report.tempCheck.verdict.status}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {report.tempCheck.verdict.reason || report.tempCheck.verdict.title}
                    </p>
                    {report.tempCheck.verdict.reasons?.map((r, i) => (
                      <p key={i} className="text-[10px] font-medium text-rose-800 dark:text-rose-200">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Context */}
              {report.tempCheck.order && (
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-[11px] flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Order: <strong className="font-mono text-gray-900 dark:text-white">{report.tempCheck.order.orderId}</strong> ({report.tempCheck.order.orderStatus})</span>
                  <span>{report.tempCheck.order.orderedAt}</span>
                </div>
              )}

              {/* Temperature Metrics Summary */}
              {report.tempCheck.summary && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Lowest</span>
                    <span className="text-sm font-black text-sky-700 dark:text-sky-300">{report.tempCheck.summary.lowest}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Average</span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{report.tempCheck.summary.average}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Highest</span>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-300">{report.tempCheck.summary.highest}°C</span>
                  </div>
                </div>
              )}

              {/* Telemetry Log Table */}
              {report.tempCheck.readings && report.tempCheck.readings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                    Sensor Readings ({report.tempCheck.readings.length} pings recorded):
                  </span>
                  <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-1.5 px-3">Time</th>
                          <th className="py-1.5 px-3">Temp</th>
                          <th className="py-1.5 px-3">Status</th>
                          <th className="py-1.5 px-3">Telemetry Event</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {report.tempCheck.readings.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                            <td className="py-1.5 px-3 font-mono font-medium">{r.time}</td>
                            <td className="py-1.5 px-3 font-mono font-bold">{r.temp.toFixed(1)}°C</td>
                            <td className="py-1.5 px-3">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                r.status === 'OK'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{r.event}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: Fleet Turnaround & 36h Refund SLA (fleet_scan.py) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-950 dark:text-white">
                      Fleet Turnaround & 36h SLA Status
                    </h4>
                    <span className="text-[10px] text-gray-500">Script #3: fleet_scan.py Logic</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  Limit: {report.fleetDetails.limitHours} Hours • Deposit: ₹{report.fleetDetails.depositAmount}
                </span>
              </div>

              {/* Decision Badge */}
              <div className={`p-3.5 rounded-xl border ${
                report.fleetDetails.decision.status === 'ELIGIBLE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : report.fleetDetails.decision.status === 'WAIT'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5 opacity-90" />
                  <div className="space-y-0.5">
                    <div className="font-black text-xs uppercase tracking-wide">
                      REFUND DECISION: {report.fleetDetails.decision.status}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {report.fleetDetails.decision.reason}
                    </p>
                    {report.fleetDetails.decision.refundRecorded && (
                      <p className="text-[10px] font-semibold opacity-90 mt-1">
                        Note: {report.fleetDetails.decision.refundRecorded}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Delivery Window */}
              {report.fleetDetails.thisDelivery && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-[11px] space-y-1 text-gray-600 dark:text-gray-300">
                  <div className="font-bold text-gray-900 dark:text-white">Current Delivery Tracking:</div>
                  <div className="flex justify-between">
                    <span>Order #{report.fleetDetails.thisDelivery.orderId}</span>
                    <span>Delivered: {report.fleetDetails.thisDelivery.deliveredAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Pickup:</span>
                    <span>{report.fleetDetails.thisDelivery.returnedAt || 'Pending Customer Return'}</span>
                  </div>
                </div>
              )}

              {/* History Statistics */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  Cooler Operational History ({report.fleetDetails.history.deliveries} total trips):
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Avg Return</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {report.fleetDetails.history.averageReturnHours !== null ? `${report.fleetDetails.history.averageReturnHours}h` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Median Return</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {report.fleetDetails.history.medianReturnHours !== null ? `${report.fleetDetails.history.medianReturnHours}h` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Recovery Rate</span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {report.fleetDetails.history.recoveryRatePct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Cycle Wear Gauge */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  <span>Cycle Aging Lifecycle ({report.cooler.cyclesUsed || 0} / 30 rated trips)</span>
                  <span className="font-bold">{Math.round(((report.cooler.cyclesUsed || 0) / 30) * 100)}% Used</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (report.cooler.cyclesUsed || 0) >= 25 
                        ? 'bg-rose-500' 
                        : (report.cooler.cyclesUsed || 0) >= 15 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(((report.cooler.cyclesUsed || 0) / 30) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Rapid Operations Actions (Sanitize, Flag Breakdown, Decommission) */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-extrabold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-gray-500" />
                  Cooler Depot Actions & Maintenance Operations
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Update box lifecycle status, record UV-C sanitization batches, or flag defective insulation for depot repair.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleAction('sanitize', 'Certified UV-C cycle + new ice bricks')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Log UV Sanitization</span>
                </button>

                <button
                  onClick={() => handleAction('flag_damage', 'Worn silicone seal or insulation leak')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flag Gasket/Lid Breakdown</span>
                </button>

                {report.cooler.status !== 'decommissioned' ? (
                  <button
                    onClick={() => handleAction('decommission', 'Retired from active cold chain')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Decommission</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('recommission', 'Reconditioned with new gasket seal')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Recommission Box</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
