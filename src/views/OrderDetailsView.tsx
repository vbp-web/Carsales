import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Receipt,
  AlertCircle,
  Sparkles,
  Navigation,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Download,
  FileText
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { OrderTrackingProgressBar } from '../components/orders/OrderTrackingProgressBar.tsx';
import { generateInvoicePdf } from '../utils/generateInvoicePdf.ts';

interface OrderDetailsViewProps {
  orderId: string;
  onBack: () => void;
  onNavigateProduct: (id: string) => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  orderId,
  onBack,
  onNavigateProduct
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracking' | 'all' | 'items'>('all');
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadInvoice = () => {
    if (!order) return;
    try {
      setIsDownloadingInvoice(true);
      generateInvoicePdf(order);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Invoice generation error:', err);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await api.orders.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed loading order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-zinc-500 animate-pulse space-y-4">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PLACED: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/60 dark:border-blue-800/40',
    CONFIRMED: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/40',
    PROCESSING: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800/40',
    PACKED: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/60 dark:border-indigo-800/40',
    SHIPPED: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/60 dark:border-cyan-800/40',
    OUT_FOR_DELIVERY: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/60 dark:border-teal-800/40',
    DELIVERED: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/40',
    CANCELLED: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800/40'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header with 'Track Order' CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1.5 cursor-pointer mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white font-display">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded border transition-colors ${
                statusColors[order.orderStatus] || 'text-zinc-500 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Controls & Carrier Summary */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Download Invoice Button */}
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border ${
              downloadSuccess
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-100 dark:border-zinc-800'
            }`}
            title="Download GST Tax Invoice Summary (PDF)"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Invoice Downloaded</span>
              </>
            ) : (
              <>
                <Download className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${isDownloadingInvoice ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingInvoice ? 'Generating PDF...' : 'Download Invoice'}</span>
              </>
            )}
          </button>

          {/* Quick Track Order CTA Button */}
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              activeTab === 'tracking'
                ? 'bg-red-600 text-white shadow-red-500/25 ring-2 ring-red-600/30'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900'
            }`}
            title="Open Live Shipment Tracker"
          >
            <Truck className="w-4 h-4 text-red-500" />
            <span>Track Order</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>

          {/* Carrier Info Card */}
          <div className="p-2.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-0.5 shadow-sm hidden md:block">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Carrier:</span>
              <strong className="text-zinc-800 dark:text-zinc-200">{order.carrier}</strong>
            </div>
            <p className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold truncate max-w-[140px]">
              {order.trackingNumber}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mode Navigation Tabs */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <span>Complete Order & Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'tracking'
                ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Order (Live GPS)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'items'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Items ({order.items.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 hidden lg:inline font-mono shrink-0">
          AWB: {order.trackingNumber}
        </span>
      </div>

      {/* 3. Real-Time Shipping Visual Progress Bar Component */}
      {(activeTab === 'all' || activeTab === 'tracking') && (
        <section aria-label="Order Tracking Section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600 dark:text-red-500" />
              Real-Time Visual Shipping Progress
            </h2>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Carrier Feed Active
            </span>
          </div>

          <OrderTrackingProgressBar
            order={order}
            onOrderUpdated={(updated) => setOrder(updated)}
          />
        </section>
      )}

      {/* 4. Item Details and Shipping / Payment Grid */}
      {(activeTab === 'all' || activeTab === 'items') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Left 2 Cols: Items */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Items in this Shipment ({order.items.length})</span>
              <span className="text-[10px] text-zinc-500 lowercase font-normal">Click item for product page</span>
            </h3>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateProduct(item.productId)}
                  className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-xl flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-colors shadow-sm group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-transparent group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono block">SKU: {item.sku}</span>
                      {item.vehicleCompatibility && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.vehicleCompatibility}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white tabular-nums">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Shipping & Receipt Summary */}
          <div className="space-y-5">
            {/* Shipping destination */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-red-600 dark:text-red-500" />
                Delivery Address
              </span>
              <p className="font-bold text-zinc-900 dark:text-white">{order.shippingAddress.name}</p>
              <p className="text-zinc-700 dark:text-zinc-300">
                {order.shippingAddress.addressLine1} {order.shippingAddress.apartment}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-[11px] text-zinc-500">Phone: {order.shippingAddress.phone}</p>
            </div>

            {/* Payment receipt */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Receipt className="w-3 h-3 text-red-600 dark:text-red-500" />
                Payment Information
              </span>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Method:</span>
                <span className="text-zinc-900 dark:text-white font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Razorpay Order ID:</span>
                <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]">
                  {order.payment.razorpayOrderId}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Payment ID:</span>
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 truncate max-w-[130px]">
                  {order.payment.razorpayPaymentId}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Status:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{order.payment.status}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Price Breakdown
              </span>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span className="tabular-nums">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>GST (18%)</span>
                <span className="tabular-nums">₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Express Shipping</span>
                <span className="tabular-nums">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Paid</span>
                <span className="text-red-600 dark:text-red-500 tabular-nums">₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Official Tax Invoice Card */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                  Tax Invoice
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
                  GST Compliant
                </span>
              </div>
              
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Includes full breakdown of itemized costs, HSN classification, GST (18%), carrier AWB, and supplier tax registration.
              </p>

              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-red-500/20 disabled:opacity-50"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Invoice PDF Saved</span>
                  </>
                ) : (
                  <>
                    <Download className={`w-3.5 h-3.5 ${isDownloadingInvoice ? 'animate-bounce' : ''}`} />
                    <span>{isDownloadingInvoice ? 'Generating PDF...' : 'Download Invoice (PDF)'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

