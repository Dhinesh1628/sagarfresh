import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, CheckCircle2, Zap } from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api';

interface OrderTrackingPageProps {
  onNavigateToReturns: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onNavigateToReturns }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatingSensor, setSimulatingSensor] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(prev => {
          if (!prev) return data[0];
          const found = data.find(o => o.id === prev.id);
          return found || data[0];
        });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSimulateProbe = async () => {
    if (!selectedOrder) return;
    setSimulatingSensor(true);
    try {
      const updated = await api.simulateTemp(selectedOrder.id);
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    } catch (err) {
      console.error('Probe simulation failed:', err);
    } finally {
      setSimulatingSensor(false);
    }
  };

  const stages = [
    'Order Confirmed',
    'Cold Box Packed',
    'Out for Delivery',
    'Delivered'
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.indexOf(status);
    return idx === -1 ? 1 : idx;
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-gray-900">Live Cold-Chain Tracking & Sensor Telemetry</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              0°C - 4°C Fresh
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time IoT core probe monitoring inside your reusable ThermalVault insulated box
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-xs text-gray-400">
          Loading order telemetry...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
          No orders on file yet. Place an order from the cuts catalog to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Orders List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Orders</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-rose-50/70 border-[#d11243] shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900">{order.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#d11243] border border-rose-200">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-gray-600">
                      <span>{order.items.length} cut(s) • ₹{order.total}</span>
                      <span className="font-mono text-emerald-700 font-bold">{order.liveTemp}°C</span>
                    </div>

                    <div className="mt-1 text-[11px] text-gray-400">
                      Box ID: {order.coolerId}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
                
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-gray-950">Order {selectedOrder.id}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#d11243] border border-rose-200">
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Box Tag: <strong className="text-gray-800">{selectedOrder.coolerId}</strong> • Slot: {selectedOrder.deliverySlot}
                    </p>
                  </div>

                  {/* Temperature readout widget */}
                  <div className="flex items-center gap-3 bg-gray-50 px-3.5 py-2.5 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium">Box Core Temperature</div>
                      <div className="text-xl font-black font-mono text-[#d11243]">
                        {selectedOrder.liveTemp}°C
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>FSSAI Compliant (0°C - 4°C)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateProbe}
                      disabled={simulatingSensor}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs"
                      title="Simulate Cold-Gel Core Probe Sensor"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${simulatingSensor ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stages */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                    Delivery Progression
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {stages.map((st, idx) => {
                      const curIdx = getStageIndex(selectedOrder.status);
                      const isComplete = idx <= curIdx;
                      const isCurrent = idx === curIdx;

                      return (
                        <div
                          key={st}
                          className={`p-3 rounded-lg border ${
                            isCurrent
                              ? 'bg-rose-50 border-[#d11243] text-[#d11243] font-bold'
                              : isComplete
                              ? 'bg-gray-50 border-gray-300 text-gray-800 font-semibold'
                              : 'bg-gray-50/50 border-gray-200 text-gray-400'
                          }`}
                        >
                          <div className="text-[10px] font-mono text-gray-400 mb-0.5">0{idx + 1}</div>
                          <div>{st}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Executive & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <span className="font-bold text-gray-600 block">Assigned Delivery Partner:</span>
                    <p className="text-gray-900 font-semibold">{selectedOrder.deliveryExecutive || 'Local Hub Partner'}</p>
                    <p className="text-gray-500 text-[11px] mt-1">Payment Method: {selectedOrder.paymentMethod}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <span className="font-bold text-gray-600 block">Drop Address:</span>
                    <p className="text-gray-800 text-[11px]">{selectedOrder.deliveryAddress}</p>
                    {selectedOrder.deliveryNotes && (
                      <p className="text-gray-500 text-[10px] italic mt-1">"{selectedOrder.deliveryNotes}"</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Packed Cuts in this Box ({selectedOrder.items.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900">{it.name}</div>
                          <div className="text-[11px] text-gray-500">{it.quantity}x {it.unit}</div>
                        </div>
                        <span className="font-bold text-gray-950 font-mono">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Cold-Gel Core Temperature Log
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Probe Readout</th>
                          <th className="py-2.5 px-3">Cold-Chain Event</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px]">
                        {selectedOrder.tempLog?.map((l, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-mono text-gray-500">{l.time}</td>
                            <td className="py-2 px-3 font-mono text-emerald-700 font-bold">{l.temp}°C</td>
                            <td className="py-2 px-3 text-gray-700">{l.event}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Return Prompt & ₹250 Refundable Cooler Box Notice */}
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-sky-950">
                      <span>❄️ ThermalVault Reusable Cold Box ({selectedOrder.coolerId})</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-black">
                        ₹250 Deposit Active
                      </span>
                    </div>
                    <span className="text-sky-800 text-[11px] block mt-0.5">
                      Hand back to the courier at delivery or request 1-click doorstep collection in the app to get ₹250 refunded directly to your UPI ID.
                    </span>
                  </div>
                  <button
                    onClick={onNavigateToReturns}
                    className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-extrabold text-xs cursor-pointer shrink-0 transition shadow-xs"
                  >
                    Schedule Cooler Return (₹250)
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
