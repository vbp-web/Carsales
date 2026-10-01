import React, { useEffect, useState } from 'react';
import { Package, ChevronRight, Download, FileText } from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { generateInvoicePdf } from '../utils/generateInvoicePdf.ts';

interface OrdersViewProps {
  onSelectOrder: (id: string) => void;
  onNavigateHome: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onSelectOrder, onNavigateHome }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (err) {
        console.error('Failed fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

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
      <div className="border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <h1 className="text-2xl font-black text-zinc-950 dark:text-white font-display">My Orders & Shipments</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Track packages, check fitment certifications, and download GST invoices.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse h-32" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">You haven't placed any orders yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Upgrade your car interior, exterior aerodynamics, and 4K dash surveillance systems today.
          </p>
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-500/20"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl transition-all cursor-pointer space-y-4 group shadow-sm hover:shadow-md"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    Order #{order.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      statusColors[order.orderStatus] || 'text-zinc-500 border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="font-bold text-zinc-950 dark:text-white tabular-nums">Total: ₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Items Preview & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-transparent"
                      />
                      <div className="max-w-[180px] sm:max-w-[200px] text-xs">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateInvoicePdf(order);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                    title="Download Tax Invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                    <span>Invoice</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400">
                    <span>Track Package & Details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
