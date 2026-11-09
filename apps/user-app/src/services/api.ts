import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const TOKEN_KEY = 'gomeat_token';

class ApiService {
  private token: string | null = null;

  async initToken(): Promise<string | null> {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Network request timed out. Please check your connection to the GoMeat server.');
      }
      throw err;
    }
  }

  // Auth Endpoints
  async login(loginIdentifier: string, password: string) {
    const res = await this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginIdentifier, password }),
    });
    if (res?.token) {
      await this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  // Catalog
  async getProducts(category?: string, search?: string) {
    const params: string[] = [];
    if (category && category !== 'All') {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    if (search && search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.request<any[]>(`/products${query}`);
  }

  // Orders
  async getMyOrders() {
    return this.request<any[]>('/orders');
  }

  async getOrderById(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(payload: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Wallet & Cold Box Return
  async getWallet() {
    return this.request<any>('/wallet');
  }

  async requestCoolerReturn(coolerId: string, upiId: string, method = 'wallet') {
    return this.request<any>('/wallet/return-request', {
      method: 'POST',
      body: JSON.stringify({ coolerId, upiId, method }),
    });
  }
}

export const api = new ApiService();
