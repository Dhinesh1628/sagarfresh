import type { Order } from '../types';
import { getOrderDeliveryPin } from './pinHelper';

export function generateAndPrintInvoice(order: Order) {
  const invoiceWindow = window.open('', '_blank', 'width=850,height=900');
  if (!invoiceWindow) {
    alert('Please allow popups to view and download your invoice.');
    return;
  }

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString();

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>GoMeat Tax Invoice #${order.orderNumber || order.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #fff; }
        .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d11243; padding-bottom: 20px; }
        .logo-text { font-size: 26px; font-weight: 900; color: #d11243; letter-spacing: -0.5px; }
        .tagline { font-size: 11px; color: #64748b; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; }
        .invoice-title p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
        .parties { display: flex; justify-content: space-between; margin-top: 25px; font-size: 12px; line-height: 1.6; }
        .party { width: 48%; }
        .party h4 { margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 12px; }
        th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 1px solid #cbd5e1; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-section { margin-top: 20px; display: flex; justify-content: flex-end; }
        .totals-table { width: 340px; font-size: 12px; line-height: 1.8; }
        .totals-table .total-row { font-size: 15px; font-weight: 900; color: #d11243; border-top: 2px solid #e2e8f0; padding-top: 6px; }
        .deposit-highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 25px; font-size: 11px; color: #166534; line-height: 1.5; }
        .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="logo-text">GoMeat</div>
            <div class="tagline">Fresh Quality. Delivered with Care. • 0°C to 4°C Cold Chain</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
              FSSAI Central Lic: 11224333000491 | GSTIN: 29AAECS4912J1Z8
            </div>
          </div>
          <div class="invoice-title">
            <h2>Tax Invoice</h2>
            <p><strong>Order #:</strong> ${order.orderNumber || order.id}</p>
            <p><strong>Handover PIN:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: 900; color: #d11243; background: #fff1f2; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecdd3;">${order.deliveryPin || getOrderDeliveryPin(order)}</span></p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> ${order.paymentStatus || 'PAID'}</p>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h4>Billed By:</h4>
            <strong>GoMeat Technologies Pvt. Ltd.</strong><br>
            Central Cold Depot, Outer Ring Road,<br>
            Mahadevapura, Bengaluru, Karnataka 560048<br>
            Support: concierge@gomeat.in | +91 97412 88301
          </div>
          <div class="party">
            <h4>Billed To:</h4>
            <strong>${order.customerName || 'Customer'}</strong><br>
            ${order.customerPhone ? `Phone: ${order.customerPhone}<br>` : ''}
            ${order.customerEmail ? `Email: ${order.customerEmail}<br>` : ''}
            ${order.deliveryAddress}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th class="text-center">Cut Style</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.name}</strong><br><span style="font-size: 10px; color: #64748b;">${it.unit} (${it.netWeight || '450g net'})</span></td>
                <td class="text-center">${it.cutStyle || 'Standard'}</td>
                <td class="text-center">${it.quantity}</td>
                <td class="text-right">₹${it.price}</td>
                <td class="text-right">₹${it.price * it.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="totals-table">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <strong>₹${order.subtotal}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #16a34a;">
              <span>ThermalVault™ Box Deposit:</span>
              <strong>+₹${order.coolerDeposit || 250} (Refundable)</strong>
            </div>
            ${order.discountAmount ? `
            <div style="display: flex; justify-content: space-between; color: #16a34a;">
              <span>Promo Discount (${order.couponCode || 'PROMO'}):</span>
              <strong>-₹${order.discountAmount}</strong>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between;">
              <span>Delivery Fee:</span>
              <span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div class="total-row" style="display: flex; justify-content: space-between;">
              <span>Total Paid:</span>
              <span>₹${order.total || order.totalAmount}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
              Payment Method: <strong>${order.paymentMethod || 'Razorpay Online'}</strong><br>
              ${order.razorpayPaymentId ? `Razorpay Payment ID: <strong>${order.razorpayPaymentId}</strong>` : ''}
            </div>
          </div>
        </div>

        <div class="deposit-highlight">
          <strong>♻️ ₹250 ThermalVault™ Deposit Refund Notice:</strong><br>
          Your meat was delivered in an insulated ThermalVault cooler holding 0°C to 4°C. When empty, return it to the courier or schedule a 1-click doorstep pickup in your GoMeat customer dashboard to receive an instant ₹250 UPI refund.
        </div>

        <div class="footer">
          This is a computer-generated tax invoice and does not require physical signature. Generated via GoMeat Cold-Chain Core Engine.
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="background: #d11243; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </div>
    </body>
    </html>
  `;

  invoiceWindow.document.write(invoiceHtml);
  invoiceWindow.document.close();
}
