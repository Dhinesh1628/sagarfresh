import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const RIDER_TOKEN_KEY = 'gomeat_rider_token';

class DeliveryApiService {
  private token: string | null = null;

  async initToken(): Promise<string | null> {
    try {
      this.token = await AsyncStorage.getItem(RIDER_TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(RIDER_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(RIDER_TOKEN_KEY);
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

  async getAssignedOrders() {
    return this.request<any[]>('/orders');
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return this.request<any>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async confirmHandover(orderId: string, pin: string, coolerReturned: boolean) {
    return this.request<any>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'delivered',
        deliveryPin: pin,
        coolerReturned,
        notes: `Handover verified via customer PIN ${pin}. Cooler returned: ${coolerReturned ? 'YES' : 'NO'}.`,
      }),
    });
  }

  async recordCoolerCollection(coolerId: string, customerPhone?: string, condition = 'good') {
    return this.request<any>('/coolers/assign', {
      method: 'POST',
      body: JSON.stringify({
        coolerId,
        status: 'returned',
        condition,
        customerPhone,
      }),
    });
  }
}

export const deliveryApi = new DeliveryApiService();
