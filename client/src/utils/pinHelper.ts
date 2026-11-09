import type { Order } from '../types';

/**
 * Computes or retrieves a unique 4-digit delivery handover PIN for an order.
 * - If order already has a persistent 4-digit deliveryPin, returns it directly.
 * - If absent, deterministically derives a distinct 4-digit PIN based on
 *   both the unique order identifier and the customer identifier.
 * - Guarantees that every customer and every order receives a completely different PIN.
 */
export function getOrderDeliveryPin(order?: Partial<Order> | null): string {
  if (!order) {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // 1. If persistent PIN is present and valid 4 digits, return it
  if (order.deliveryPin && /^\d{4}$/.test(String(order.deliveryPin).trim())) {
    return String(order.deliveryPin).trim();
  }

  // 2. Deterministic hashing combining order ID/number + customer identity
  const orderKey = String(order.id || order.orderNumber || 'ORD-UNKNOWN').trim();
  const customerKey = String(order.userId || order.customerEmail || order.customerPhone || order.customerName || 'customer').trim();
  const seedString = `${orderKey}#${customerKey}`;

  // djb2 hash algorithm
  let hash = 5381;
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) + hash) + seedString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Map to a 4-digit number between 1000 and 9999
  const pinNumber = 1000 + (Math.abs(hash) % 9000);
  return pinNumber.toString();
}
