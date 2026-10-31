import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { AdminMetrics, Order, Cooler, CoolerReturn, Product } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'coolers' | 'returns' | 'products'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coolers, setCoolers] = useState<Cooler[]>([]);
  const [returns, setReturns] = useState<CoolerReturn[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New cut form
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fish & Seafood',
    description: '',
    price: '',
    mrp: '',
    unit: '500g',
    netWeight: '450g',
    grossWeight: '600g',
    pieces: '4-6 Steaks',
    serves: 'Serves 3-4',
    chillingMethod: '0°C to 4°C FreshSeal™ Cold Chain',
    catchDate: 'Daily Harbor Catch',
    origin: 'Mangalore Old Port, Karnataka',
    cutStyle: 'Curry Cut Steaks',
    stock: '30',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
  });

  const loadAllData = async () => {
    try {
      const [m, o, c, r, p] = await Promise.all([
        api.getAdminMetrics(),
        api.getOrders(),
        api.getCoolers(),
        api.getReturns(),
        api.getProducts()
      ]);
      setMetrics(m);
      setOrders(o);
      setCoolers(c);
      setReturns(r);
      setProducts(p);
    } catch (err) {
      console.error('Failed to load operations data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification(`Order ${orderId} transitioned to "${newStatus}"`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleReturnStatusUpdate = async (returnId: string, newStatus: string) => {
    try {
      await api.updateReturnStatus(returnId, newStatus, 'Box inspected: EPP walls intact, gel bricks sanitized.');
      showNotification(`Return ${returnId} marked "${newStatus}". ₹250 refund credited to customer UPI.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Return approval failed');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        price: parseInt(newProduct.price, 10),
        mrp: parseInt(newProduct.mrp || newProduct.price, 10),
        unit: newProduct.unit,
        netWeight: newProduct.netWeight,
        grossWeight: newProduct.grossWeight,
        pieces: newProduct.pieces,
        serves: newProduct.serves,
        chillingMethod: newProduct.chillingMethod,
        catchDate: newProduct.catchDate,
        origin: newProduct.origin,
        cutStyle: newProduct.cutStyle,
        stock: parseInt(newProduct.stock, 10),
        image: newProduct.image,
        vacuumSealed: true
      });
      setShowAddProductModal(false);
      showNotification(`Added "${newProduct.name}" to inventory.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to add cut');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from inventory?`)) return;
    try {
      await api.deleteProduct(id);
      showNotification(`Removed "${name}" from catalog.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete cut');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-base font-extrabold text-gray-950">Central Fulfillment Hub (Bengaluru Depot)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Logged in as <strong className="text-[#d11243]">{user?.name}</strong> • Cold-chain dispatch, cooler assets & return refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-3.5 py-1.5 bg-[#d11243] hover:bg-[#b80f3b] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Cut to Catalog
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {actionNotice}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
            activeTab === 'metrics' ? 'bg-[#d11243] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Hub Metrics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#d11243] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Order Dispatches ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('coolers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
            activeTab === 'coolers' ? 'bg-[#d11243] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cold Box Assets ({coolers.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
            activeTab === 'returns' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Return Pickups & UPI Refunds ({returns.filter(r => r.status !== 'refunded').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
            activeTab === 'products' ? 'bg-[#d11243] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Inventory Catalog ({products.length})
        </button>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-gray-500 block">Total Cuts Revenue</span>
              <div className="text-xl font-black text-gray-950 mt-1">₹{metrics.totalRevenue}</div>
              <span className="text-gray-400 text-[11px]">{metrics.totalOrders} total delivered / active orders</span>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-gray-500 block">Boxes with Customers</span>
              <div className="text-xl font-black text-[#d11243] mt-1">{metrics.coolersInCustody} Units</div>
              <span className="text-gray-400 text-[11px]">{metrics.availableCoolers} available in depot storage</span>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-gray-500 block">Box Return Rate</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{metrics.coolerReturnRate}%</div>
              <span className="text-gray-400 text-[11px]">{metrics.completedReturns} deposits reversed via UPI</span>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-gray-500 block">Cold-Chain SLA Compliance</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{metrics.coldChainCompliance}%</div>
              <span className="text-gray-400 text-[11px]">0°C to 4°C temperature maintained</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 text-xs shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-950 text-sm">{order.id}</span>
                    <span className="text-gray-600 font-medium">{order.customerName} ({order.customerPhone})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#d11243] border border-rose-200">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-gray-500 mt-0.5">
                    Box ID: <strong className="text-gray-900">{order.coolerId}</strong> • Total: <strong className="text-gray-950 font-bold">₹{order.total}</strong> (incl. ₹250 box deposit)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Update Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Cold Box Packed">Cold Box Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Cuts to Pack:</span>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 text-[11px]">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="text-emerald-700 font-mono">{it.chillingMethod}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Delivery Info:</span>
                  <p className="text-gray-800 text-[11px]">{order.deliveryAddress}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Executive: {order.deliveryExecutive}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COOLERS */}
      {activeTab === 'coolers' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="py-3 px-3">Box Tag</th>
                  <th className="py-3 px-3">Model</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Holder / Customer</th>
                  <th className="py-3 px-3">Trips Completed</th>
                  <th className="py-3 px-3">Sanitized Date</th>
                  <th className="py-3 px-3">Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {coolers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{c.id}</td>
                    <td className="py-2.5 px-3">{c.model}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{c.currentUserName || 'In Central Hub Depot'}</td>
                    <td className="py-2.5 px-3 font-mono">{c.cyclesUsed} trips</td>
                    <td className="py-2.5 px-3">{c.lastSanitizedDate}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">₹{c.depositAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RETURNS */}
      {activeTab === 'returns' && (
        <div className="space-y-3">
          {returns.map((ret) => {
            const isRefunded = ret.status === 'refunded';
            return (
              <div key={ret.id} className="p-4 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-950">{ret.id}</span>
                    <span className="font-mono text-gray-500">Box: {ret.coolerId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isRefunded ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {ret.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRefunded ? (
                      <>
                        <button
                          onClick={() => handleReturnStatusUpdate(ret.id, 'picked_up')}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Mark Collected
                        </button>
                        <button
                          onClick={() => handleReturnStatusUpdate(ret.id, 'refunded')}
                          className="px-3.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          Approve & Refund ₹250 to UPI
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-700 text-xs font-bold">
                        ₹250 Refunded via UPI
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px]">
                  <div>Customer: <strong className="text-gray-900">{ret.userName}</strong> ({ret.userPhone})</div>
                  <div>Pickup Slot: <span className="text-gray-700">{ret.scheduledPickupSlot}</span></div>
                  <div>UPI Target: <strong className="text-[#d11243]">{ret.refundMode}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-3.5 bg-white border border-gray-200 rounded-xl flex flex-col justify-between text-xs space-y-2 shadow-2xs">
              <div className="space-y-1.5">
                <div className="h-28 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-[#d11243] uppercase font-bold">{p.category}</span>
                <h4 className="font-bold text-gray-900 text-xs">{p.name}</h4>
                <p className="text-gray-500 text-[11px] line-clamp-2">{p.description}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-gray-950 text-sm">₹{p.price}</span>
                  <span className="text-[10px] text-gray-400 block">{p.unit} • Stock: {p.stock}</span>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                  title="Delete cut"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowAddProductModal(false)} className="fixed inset-0 bg-black/60" />

          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl p-5 text-gray-800 z-10 space-y-3 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm">Add Fresh Cut to GoMeat Catalog</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Cut / Fish Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Mangalore Kane / Ladyfish"
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                  >
                    <option value="Fish & Seafood">Fish & Seafood</option>
                    <option value="Tender Mutton">Tender Mutton</option>
                    <option value="Fresh Chicken">Fresh Chicken</option>
                    <option value="Ready to Cook">Ready to Cook</option>
                    <option value="Combo Box">Combo Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="499"
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Net Weight</label>
                  <input
                    type="text"
                    value={newProduct.netWeight}
                    onChange={(e) => setNewProduct({ ...newProduct, netWeight: e.target.value })}
                    placeholder="450g"
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Pieces & Serves</label>
                  <input
                    type="text"
                    value={newProduct.pieces}
                    onChange={(e) => setNewProduct({ ...newProduct, pieces: e.target.value })}
                    placeholder="4-6 Pieces (Serves 2-3)"
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Fresh from daily catch, cleaned in RO water..."
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition"
              >
                Save Cut to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
