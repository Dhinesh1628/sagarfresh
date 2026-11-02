import { Product, Order, Cooler, CoolerReturn, AdminMetrics, User } from './types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('frost_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async googleLogin(credential: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Google authentication failed. Please try again.');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  async demoLogin(role: 'customer' | 'admin') {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Demo login failed');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user');
    }
    return res.json();
  },

  // Products
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/products`);
    if (params?.category && params.category !== 'All') {
      url.searchParams.set('category', params.category);
    }
    if (params?.search) {
      url.searchParams.set('search', params.search);
    }
    const res = await fetch(url.toString(), {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch cuts');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add product');
    }
    return res.json();
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Orders
  async createOrder(orderData: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    deliverySlot: string;
    deliveryNotes?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async simulateTemp(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/simulate-temp`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Sensor telemetry failed');
    return res.json();
  },

  // Coolers & Returns
  async getCoolers(): Promise<Cooler[]> {
    const res = await fetch(`${API_BASE}/coolers`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch coolers');
    return res.json();
  },

  async getMyCoolers(): Promise<{ coolers: Cooler[]; returns: CoolerReturn[] }> {
    const res = await fetch(`${API_BASE}/coolers/my-coolers`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch personal cooler inventory');
    return res.json();
  },

  async requestCoolerReturn(data: {
    coolerId: string;
    pickupSlot: string;
    notes?: string;
    address?: string;
  }): Promise<CoolerReturn> {
    const res = await fetch(`${API_BASE}/coolers/request-return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request cooler return');
    }
    return res.json();
  },

  async getReturns(): Promise<CoolerReturn[]> {
    const res = await fetch(`${API_BASE}/returns`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch returns');
    return res.json();
  },

  async updateReturnStatus(id: string, status: string, conditionNotes?: string): Promise<CoolerReturn> {
    const res = await fetch(`${API_BASE}/returns/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, conditionNotes })
    });
    if (!res.ok) throw new Error('Failed to update return status');
    return res.json();
  },

  // Admin Metrics
  async getAdminMetrics(): Promise<AdminMetrics> {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load operations metrics');
    return res.json();
  }
};
