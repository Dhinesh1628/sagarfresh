import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Camera, Search, AlertTriangle, ShieldCheck, 
  Thermometer, CheckCircle2, RefreshCw, X, ArrowRight, 
  Zap, Check, Building, Phone, Clock, Wallet, Smartphone, 
  ShieldAlert, Box, Sparkles
} from 'lucide-react';
import jsQR from 'jsqr';
import { api } from '../api';

interface ColdBoxScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoolerId?: string;
  onRefundApproved?: () => void;
}

export const ColdBoxScannerModal: React.FC<ColdBoxScannerModalProps> = ({
  isOpen,
  onClose,
  initialCoolerId,
  onRefundApproved
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'mock' | 'manual'>('camera');
  const [inputBoxId, setInputBoxId] = useState(initialCoolerId || '');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionData, setInspectionData] = useState<any | null>(null);
  
  // Refund state
  const [refundPreference, setRefundPreference] = useState<'wallet' | 'upi'>('wallet');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);
  const [flaggingDamage, setFlaggingDamage] = useState(false);
  const [damageNotice, setDamageNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Available sample boxes for instant 1-click inspection testing
  const sampleBoxes = [
    {
      id: 'BOX-BLR-417',
      label: 'Box #417 (With Customer)',
      status: 'with_customer',
      temp: '1.8°C',
      tag: 'Eligible for ₹250 Refund',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'BOX-BLR-182',
      label: 'Box #182 (Courier Dispatched)',
      status: 'assigned',
      temp: '2.1°C',
      tag: 'In Transit SLA Under 48h',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'BOX-BLR-103',
      label: 'Box #103 (Temp Breach)',
      status: 'breach',
      temp: '5.8°C ⚠️',
      tag: 'Degraded Gasket Seal (Flagged)',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    {
      id: 'BOX-BLR-633',
      label: 'Box #633 (Dark Depot)',
      status: 'available',
      temp: '0.9°C',
      tag: 'Sanitized & Available',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    }
  ];

  // Camera stream lifecycle
  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  useEffect(() => {
    if (isOpen && initialCoolerId) {
      handleInspectBox(initialCoolerId);
    }
  }, [isOpen, initialCoolerId]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      stopCamera();

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraPermission('denied');
        setCameraError('Camera API is not supported in this browser environment.');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e) {
        console.warn('Ideal facingMode constraint failed, trying basic camera:', e);
        // Fallback for laptop webcams or environments that reject facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraPermission('granted');
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(pErr => console.warn('Video play prevented:', pErr));
          startQrLoop();
        };
        // Also call play directly in case loadedmetadata already fired
        videoRef.current.play().catch(() => {});
        startQrLoop();
      }
    } catch (err: any) {
      console.warn('Camera access error or desktop environment:', err);
      setCameraPermission('denied');
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser URL bar.'
          : `Camera could not start: ${err.message || 'Device busy or disconnected'}`
      );
    }
  };

  const startQrLoop = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let lastTick = 0;

    const scanFrame = (timestamp: number) => {
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        if (timestamp - lastTick > 150) {
          lastTick = timestamp;
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            try {
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth'
              });

              if (code && code.data) {
                const raw = code.data.trim();
                console.log('✅ QR Code Detected:', raw);
                
                // Extract BOX-BLR-xxx or raw code
                const match = raw.match(/BOX-BLR-\d+/i);
                const foundId = match ? match[0].toUpperCase() : raw;

                setDetectedCode(foundId);
                handleInspectBox(foundId);
                setIsScanning(false);
                return;
              }
            } catch (qrErr) {
              // frame decode error ignored
            }
          }
        }
      }
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  };

  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const playAudioChime = (type: 'scan' | 'success' | 'alert') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'scan') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext policy fallback
    }
  };

  const handleInspectBox = async (coolerIdToInspect: string) => {
    const id = coolerIdToInspect.trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setRefundSuccess(null);
    setDamageNotice(null);

    try {
      const data = await api.inspectCooler(id);
      setInspectionData(data);
      setInputBoxId(data.cooler.id);
      if (data.telemetry?.isCompliant) {
        playAudioChime('scan');
      } else {
        playAudioChime('alert');
      }
      if (data.returnRecord?.upiId) {
        setUpiIdInput(data.returnRecord.upiId);
      }
    } catch (err: any) {
      playAudioChime('alert');
      setError(err.message || `ThermalVault Box #${id} not found.`);
      setInspectionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async () => {
    if (!inspectionData?.cooler?.id) return;
    setProcessingRefund(true);
    setError(null);

    try {
      const res = await api.approveCoolerRefund(inspectionData.cooler.id, {
        refundPreference,
        upiId: refundPreference === 'upi' ? (upiIdInput || 'customer@okhdfcbank') : undefined,
        inspectorNotes: `Doorstep QR Inspection: Insulation intact, internal temp verified at ${inspectionData.telemetry?.liveTemp}°C.`
      });

      playAudioChime('success');
      setRefundSuccess(res.message);
      if (onRefundApproved) onRefundApproved();
      
      // Refresh inspection view
      setTimeout(() => {
        handleInspectBox(inspectionData.cooler.id);
      }, 1200);
    } catch (err: any) {
      playAudioChime('alert');
      setError(err.message || 'Failed to approve refund.');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleFlagDamage = async () => {
    if (!inspectionData?.cooler?.id) return;
    setFlaggingDamage(true);
    setError(null);

    try {
      const res = await api.flagCoolerDamage(
        inspectionData.cooler.id,
        'Damaged or Degraded Gasket: Box breached 4°C limit; retired for repair.'
      );
      setDamageNotice(res.message);
      setTimeout(() => {
        handleInspectBox(inspectionData.cooler.id);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to flag damage.');
    } finally {
      setFlaggingDamage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  ThermalVault™ QR Inward Scanner
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  0°C–4°C Telemetry
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Scan cold box QR code for instant return pickup, IoT temperature logs & ₹250 refund approval.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Guided Process Indicator (Crystal clear to every user) */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-black font-black text-[10px]">1</span>
            <span className="font-extrabold text-white">Scan Box QR</span>
            <span className="hidden md:inline text-[10px] text-gray-400">(Camera or 1-Tap)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full font-black text-[10px] transition-colors ${
              inspectionData ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-gray-400'
            }`}>2</span>
            <span className={`font-extrabold transition-colors ${inspectionData ? 'text-white' : 'text-gray-400'}`}>
              Check 0°C–4°C Freshness
            </span>
            <span className="hidden md:inline text-[10px] text-gray-500">(IoT Log)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full font-black text-[10px] transition-colors ${
              refundSuccess ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-gray-400'
            }`}>3</span>
            <span className={`font-extrabold transition-colors ${refundSuccess ? 'text-emerald-400' : 'text-gray-400'}`}>
              Instant ₹250 Refund
            </span>
            <span className="hidden md:inline text-[10px] text-gray-500">(Wallet / UPI)</span>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMode('camera')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'camera'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera Scanner</span>
            </button>

            <button
              onClick={() => setActiveMode('mock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'mock'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Sample Box Tester</span>
            </button>
          </div>

          {/* Quick manual box ID input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleInspectBox(inputBoxId);
            }}
            className="flex items-center gap-2 max-w-xs w-full"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputBoxId}
                onChange={(e) => setInputBoxId(e.target.value)}
                placeholder="Enter Box ID (e.g. BOX-BLR-417)..."
                className="w-full h-8 pl-8 pr-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
            >
              <span>Inspect</span>
            </button>
          </form>
        </div>

        {/* Content Body: Two Columns (Scanner Viewport on Left, Live Telemetry & Refund on Right) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Camera Scanner & Mock Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Viewport Card */}
            {activeMode === 'camera' ? (
              <div className="relative aspect-square max-h-[340px] rounded-2xl bg-black border border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
                {/* Real Video Stream - ALWAYS mounted to receive stream immediately */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch(() => {});
                      startQrLoop();
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {cameraPermission === 'granted' ? (
                  <>
                    {/* Top HUD Bar */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                      <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 ml-1.5">
                          {isScanning ? 'Scanner Active' : 'QR Detected'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                          }}
                          className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:border-white/30 text-gray-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Flip camera (Front/Back/Webcam)"
                        >
                          <RefreshCw className="w-3 h-3 text-sky-400" />
                          <span>{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Animated Scanning Reticle */}
                    <div className="absolute inset-8 pointer-events-none border-2 border-emerald-400/50 rounded-2xl flex flex-col justify-between p-2 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                      {/* 4 Glowing Corner Accents */}
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></span>
                        <span className="w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></span>
                      </div>

                      {/* Moving Laser Beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-pulse"></div>

                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></span>
                        <span className="w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></span>
                      </div>
                    </div>

                    {/* Detected Code Flash Notice */}
                    {detectedCode && (
                      <div className="absolute top-1/2 -translate-y-1/2 inset-x-6 py-2 px-3 bg-emerald-500 text-black font-black text-xs rounded-xl shadow-2xl flex items-center justify-center gap-2 animate-bounce pointer-events-none">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Box Verified: {detectedCode}</span>
                      </div>
                    )}

                    {/* Bottom Status & Quick Action Bar */}
                    <div className="absolute bottom-3 inset-x-3 flex flex-col gap-1.5 pointer-events-auto">
                      <div className="bg-black/80 backdrop-blur-md rounded-xl py-1 px-3 text-center border border-white/10">
                        <p className="text-[11px] text-emerald-300 font-bold">
                          Align box QR code inside the reticle frame
                        </p>
                      </div>

                      <button
                        onClick={() => handleInspectBox('BOX-BLR-417')}
                        className="py-1 px-2.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-black font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Simulate Scan on Live Camera (BOX-BLR-417)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-200">Camera Feed Inactive</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs">
                        {cameraError || 'Please allow camera permission in your browser address bar.'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => startCamera()}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera</span>
                      </button>
                      <button
                        onClick={() => setActiveMode('mock')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition cursor-pointer"
                      >
                        Use Sample Boxes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Interactive Mock Sample Box Clickers (Ashik Test Suite) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Quick Diagnostic Simulator
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  Tap to simulate real scan
                </span>
              </div>

              <div className="space-y-2">
                {sampleBoxes.map((box) => (
                  <button
                    key={box.id}
                    onClick={() => {
                      setInputBoxId(box.id);
                      handleInspectBox(box.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer group ${
                      inspectionData?.cooler?.id === box.id
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-black/60 border border-slate-700 flex items-center justify-center font-black text-[10px] text-emerald-400">
                        QR
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition">
                          {box.id}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {box.label}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${box.tagColor}`}>
                        {box.tag}
                      </span>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {box.temp}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FSSC & FSSAI Standard Notice */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Formalin & 0°C–4°C Compliance:</strong> Scanned boxes undergo automated thermal verification against FSSC-22000 cold-chain threshold.
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Scanned Dossier, Telemetry & Refund Action (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {loading ? (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center space-y-3 p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="font-extrabold text-sm text-white">Inspecting Box Telemetry...</p>
                <p className="text-xs text-gray-400">Connecting to IoT temperature ping log & deposit ledger</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-800/60 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="font-extrabold text-sm text-white">{error}</p>
                <p className="text-xs text-gray-400">
                  Check the Box ID or tap any of the quick sample boxes on the left.
                </p>
              </div>
            ) : inspectionData ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* 1. TOP TELEMETRY CARD */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  inspectionData.telemetry?.isCompliant
                    ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40'
                    : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/50'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white">
                          #{inspectionData.cooler.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          inspectionData.telemetry?.isCompliant
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {inspectionData.telemetry?.isCompliant ? '0°C to 4°C Verified' : '⚠️ Temperature Breach Alert'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5 font-medium">
                        {inspectionData.cooler.model}
                      </p>
                    </div>

                    {/* Big Temperature Gauge */}
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <Thermometer className={`w-5 h-5 ${inspectionData.telemetry?.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <span className={`text-2xl sm:text-3xl font-black ${inspectionData.telemetry?.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {inspectionData.telemetry?.liveTemp}°C
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold block">
                        Target: 0°C to 4°C Cold-Chain
                      </span>
                    </div>
                  </div>

                  {/* IoT Telemetry Metrics Row (Ashik's Analytics) */}
                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Insulation Score</span>
                      <span className="font-extrabold text-xs text-white">{inspectionData.telemetry?.thermalHealthScore}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Turnaround TAT</span>
                      <span className="font-extrabold text-xs text-emerald-400">{inspectionData.telemetry?.tatHours} hrs elapsed</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Eco Plastic Saved</span>
                      <span className="font-extrabold text-xs text-cyan-400">{inspectionData.telemetry?.singleUsePlasticBoxesSaved} boxes</span>
                    </div>
                  </div>
                </div>

                {/* 2. REAL-TIME TEMPERATURE LOG TIMELINE */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      IoT Temperature Ping Sequence
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      BLE Sensor Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    {inspectionData.telemetry?.tempLog?.map((ping: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span className="font-mono text-gray-400 text-[11px] shrink-0">{ping.time}</span>
                          <span className="text-gray-300 font-medium truncate max-w-[230px] sm:max-w-xs">{ping.event}</span>
                        </div>
                        <span className={`font-mono font-black text-xs shrink-0 pl-2 ${
                          ping.temp <= 4.0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {ping.temp}°C
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. ORDER & CUSTOMER PICKUP DETAILS */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2">
                  <span className="font-black uppercase tracking-wider text-gray-400 block mb-1">
                    Customer & Scheduled Pickup Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Customer Name</span>
                      <strong className="text-white text-xs">{inspectionData.cooler.currentUserName || 'Pooja Sundaram'}</strong>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Assigned Dark Hub</span>
                      <strong className="text-white text-xs">{inspectionData.cooler.assignedHub || 'Bengaluru Hub'}</strong>
                    </div>
                  </div>

                  {inspectionData.returnRecord && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-gray-300">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Pickup Slot:</span>
                        <strong className="text-white">{inspectionData.returnRecord.scheduledPickupSlot}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Partner Courier:</span>
                        <span className="text-emerald-400 font-bold">{inspectionData.returnRecord.courierAssigned}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. REFUND DECISION & DISBURSEMENT PANEL */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-950 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Deposit Reversal Ledger
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-black text-white">
                          ₹{inspectionData.refundAssessment?.depositAmount || 250}
                        </span>
                        <span className="text-xs text-emerald-400 font-extrabold">
                          100% Fully Refundable
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRefundPreference('wallet')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          refundPreference === 'wallet'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-slate-800 text-gray-300'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Wallet</span>
                      </button>

                      <button
                        onClick={() => setRefundPreference('upi')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          refundPreference === 'upi'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-slate-800 text-gray-300'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>UPI</span>
                      </button>
                    </div>
                  </div>

                  {refundPreference === 'upi' && (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-gray-400 block mb-1">Target UPI VPA for instant reversal:</label>
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="e.g. customer@okhdfcbank"
                        className="w-full h-8 px-2.5 rounded-lg bg-black border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  )}

                  {refundSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{refundSuccess}</span>
                    </div>
                  )}

                  {damageNotice && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500 text-amber-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{damageNotice}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    {inspectionData.refundAssessment?.isEligible ? (
                      <button
                        onClick={handleApproveRefund}
                        disabled={processingRefund}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        {processingRefund ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Disbursing ₹250...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-black" />
                            <span>Approve & Disburse ₹250 Refund</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-gray-400 text-xs font-bold text-center">
                        Box In-Depot / Refund Already Settled
                      </div>
                    )}

                    <button
                      onClick={handleFlagDamage}
                      disabled={flaggingDamage}
                      className="px-3 py-2.5 rounded-xl border border-rose-800/80 hover:bg-rose-950/50 text-rose-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      title="Flag for seal replacement or damaged insulation"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Flag Gasket Leak</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">How Cold Box Inward Returns Work</h4>
                      <p className="text-[11px] text-gray-400">Tap any scenario below to test live thermal diagnostics & refunds</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px] font-bold">
                    FSSC-22000 Loop
                  </span>
                </div>

                {/* 3 Live Interactive Scenario Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => handleInspectBox('BOX-BLR-417')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        ❄️
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition flex items-center gap-2">
                          <span>Standard Chilled Return (Box #417)</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            1.8°C Safe
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          EPP walls intact, gel bricks cold. Tap to simulate 1-click ₹250 refund to GoMeat Wallet or UPI.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                  </button>

                  <button
                    onClick={() => handleInspectBox('BOX-BLR-103')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        ⚠️
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-rose-400 transition flex items-center gap-2">
                          <span>Temperature Breach Anomaly (Box #103)</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            5.8°C Warning
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Simulates Ashik's anomaly detector: Gasket seal degraded. Demonstrates safety lock & quarantine flag.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                  </button>

                  <button
                    onClick={() => handleInspectBox('BOX-BLR-182')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        🚚
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-cyan-400 transition flex items-center gap-2">
                          <span>Active Delivery In-Transit (Box #182)</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            2.1°C In Route
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Courier Sunil Gowda assigned. View active telemetry timeline pings & doorstep collection schedule.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                  </button>
                </div>

                {/* Friendly Explanatory Footer */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-gray-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>₹250 Refund Protocol Guarantee:</span>
                  </div>
                  <p>
                    GoMeat charges a 100% refundable ₹250 security deposit on cold boxes to eliminate thermocol waste. Upon QR scan at doorstep or depot, ₹250 is instantly credited back to your GoMeat Wallet (0 seconds) or bank via UPI.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
