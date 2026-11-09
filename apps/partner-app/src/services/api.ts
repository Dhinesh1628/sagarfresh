import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const PARTNER_TOKEN_KEY = 'gomeat_partner_token';

class PartnerApiService {
  private token: string | null = null;

  async initToken(): Promise<string | null> {
    try {
      this.token = await AsyncStorage.getItem(PARTNER_TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(PARTNER_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(PARTNER_TOKEN_KEY);
    }
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
        throw new Error('Connection timed out. Check network to GoMeat server.');
      }
      throw err;
    }
  }

  async getHubOrders() {
    return this.request<any[]>('/orders');
  }

  async updateOrderPrep(orderId: string, status: string, coolerId?: string, notes?: string) {
    return this.request<any>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, coolerId, notes }),
    });
  }

  async getCatalogProducts() {
    return this.request<any[]>('/products');
  }

  async updateStock(productId: string, stock: number) {
    return this.request<any>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    });
  }

  async recordCoolerSanitization(coolerId: string, status = 'ready') {
    return this.request<any>('/coolers/assign', {
      method: 'POST',
      body: JSON.stringify({ coolerId, status, condition: 'sanitized_ready' }),
    });
  }
}

export const partnerApi = new PartnerApiService();
