import React, { createContext, useContext, useState, useEffect } from 'react';
import { partnerApi } from '../services/api';
import type { Product } from '@gomeat/shared';

export interface InwardBatch {
  id: string;
  item: string;
  origin: string;
  grossWeightKg: number;
  tempReading: number; // e.g. 1.7°C
  qualityGrade: 'A+' | 'A';
  time: string;
  dock: string;
}

interface PartnerContextType {
  orders: any[];
  stockItems: Product[];
  inwardBatches: InwardBatch[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  advanceOrderStage: (orderId: string, nextStage: string, coolerId?: string) => Promise<void>;
  addInwardBatch: (batch: Omit<InwardBatch, 'id' | 'time'>) => void;
  adjustStock: (productId: string, delta: number) => Promise<void>;
  markCoolerReady: (coolerId: string) => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [inwardBatches, setInwardBatches] = useState<InwardBatch[]>([
    {
      id: 'BAT-2026-081',
      item: 'Mangalore Coastal Kingfish (Surmai)',
      origin: 'Mangalore Old Port Dock',
      grossWeightKg: 120,
      tempReading: 1.6,
      qualityGrade: 'A+',
      time: '05:30 AM',
      dock: 'Cold Dock #1',
    },
    {
      id: 'BAT-2026-082',
      item: 'Farm-Fresh Broiler Cuts',
      origin: 'Hoskote Bio-Secure Farm',
      grossWeightKg: 250,
      tempReading: 2.1,
      qualityGrade: 'A+',
      time: '06:15 AM',
      dock: 'Cold Dock #2',
    },
    {
      id: 'BAT-2026-083',
      item: 'Tender Pasture-Fed Mutton',
      origin: 'Mysuru Pasture Cooperative',
      grossWeightKg: 85,
      tempReading: 1.9,
      qualityGrade: 'A+',
      time: '06:45 AM',
      dock: 'Cold Dock #1',
    },
  ]);

  const fetchOrders = async () => {
    try {
      const data = await partnerApi.getHubOrders();
      setOrders(data || []);
    } catch (err) {
      console.log('Error fetching hub orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const prods = await partnerApi.getCatalogProducts();
      setStockItems(prods || []);
    } catch (err) {
      console.log('Error fetching hub inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    // Swiggy-grade live KDS prep order sync
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const advanceOrderStage = async (orderId: string, nextStage: string, coolerId?: string) => {
    try {
      await partnerApi.updateOrderPrep(orderId, nextStage, coolerId);
    } catch (err) {
      console.log('API notice (updating locally):', err);
    }

    setOrders((prev) =>
      prev.map((o) =>
        (o.id || o.orderNumber) === orderId
          ? { ...o, prepStage: nextStage, coolerId: coolerId || o.coolerId }
          : o
      )
    );
  };

  const addInwardBatch = (batchData: Omit<InwardBatch, 'id' | 'time'>) => {
    const newBatch: InwardBatch = {
      ...batchData,
      id: `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setInwardBatches((prev) => [newBatch, ...prev]);
  };

  const adjustStock = async (productId: string, delta: number) => {
    const item = stockItems.find((p) => p.id === productId);
    if (!item) return;

    const newStock = Math.max(0, (item.stock || 0) + delta);
    setStockItems((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    try {
      await partnerApi.updateStock(productId, newStock);
    } catch (err) {
      console.log('Inventory sync notice:', err);
    }
  };

  const markCoolerReady = async (coolerId: string) => {
    try {
      await partnerApi.recordCoolerSanitization(coolerId, 'ready');
    } catch (err) {
      console.log('Cooler ready sync notice:', err);
    }
  };

  return (
    <PartnerContext.Provider
      value={{
        orders,
        stockItems,
        inwardBatches,
        loading,
        fetchOrders,
        fetchProducts,
        advanceOrderStage,
        addInwardBatch,
        adjustStock,
        markCoolerReady,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within PartnerProvider');
  }
  return context;
};
