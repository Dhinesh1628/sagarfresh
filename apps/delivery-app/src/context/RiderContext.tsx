import React, { createContext, useContext, useState, useEffect } from 'react';
import { deliveryApi } from '../services/api';
import { getOrderDeliveryPin } from '@gomeat/shared';
import { config } from '../config';

interface RiderMetrics {
  deliveredCount: number;
  coolersCollected: number;
  totalEarnings: number;
  rating: number;
}

interface RiderContextType {
  isOnline: boolean;
  toggleDuty: () => void;
  orders: any[];
  loading: boolean;
  metrics: RiderMetrics;
  fetchOrders: () => Promise<void>;
  verifyAndDeliver: (
    orderId: string,
    enteredPin: string,
    coolerReturned: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  markCoolerCollectedOnly: (coolerId: string, customerPhone?: string) => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<RiderMetrics>({
    deliveredCount: 4,
    coolersCollected: 3,
    totalEarnings: 4 * config.riderPerDropIncentive + 3 * config.coolerReturnIncentive + 60, // incl tips
    rating: 4.95,
  });

  const fetchOrders = async () => {
    try {
      const list = await deliveryApi.getAssignedOrders();
      setOrders(list || []);
    } catch (err) {
      console.log('Error fetching rider deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Swiggy-grade live order dispatch polling
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const toggleDuty = () => {
    setIsOnline((prev) => !prev);
  };

  const verifyAndDeliver = async (
    orderId: string,
    enteredPin: string,
    coolerReturned: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    const targetOrder = orders.find((o) => (o.id || o.orderNumber) === orderId) || { id: orderId };
    const expectedPin = targetOrder.deliveryPin || getOrderDeliveryPin(targetOrder);

    // 1. PIN verification
    if (enteredPin.trim() !== String(expectedPin).trim()) {
      return {
        success: false,
        message: `Incorrect Handover PIN. Ask the customer to check their GoMeat App screen.`,
      };
    }

    // 2. Transition order status on backend
    try {
      await deliveryApi.confirmHandover(orderId, enteredPin.trim(), coolerReturned);
    } catch (err) {
      console.log('API update notice (proceeding locally):', err);
    }

    // 3. Update metrics
    setMetrics((prev) => ({
      ...prev,
      deliveredCount: prev.deliveredCount + 1,
      coolersCollected: coolerReturned ? prev.coolersCollected + 1 : prev.coolersCollected,
      totalEarnings:
        prev.totalEarnings +
        config.riderPerDropIncentive +
        (coolerReturned ? config.coolerReturnIncentive : 0),
    }));

    // 4. Update orders state
    setOrders((prev) =>
      prev.map((o) =>
        (o.id || o.orderNumber) === orderId
          ? { ...o, status: 'delivered', coolerReturned }
          : o
      )
    );

    return { success: true };
  };

  const markCoolerCollectedOnly = async (coolerId: string, customerPhone?: string) => {
    try {
      await deliveryApi.recordCoolerCollection(coolerId, customerPhone);
    } catch (err) {
      console.log('API notice:', err);
    }

    setMetrics((prev) => ({
      ...prev,
      coolersCollected: prev.coolersCollected + 1,
      totalEarnings: prev.totalEarnings + config.coolerReturnIncentive,
    }));
  };

  return (
    <RiderContext.Provider
      value={{
        isOnline,
        toggleDuty,
        orders,
        loading,
        metrics,
        fetchOrders,
        verifyAndDeliver,
        markCoolerCollectedOnly,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error('useRider must be used within RiderProvider');
  }
  return context;
};
