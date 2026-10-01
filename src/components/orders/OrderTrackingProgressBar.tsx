import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Phone,
  Navigation,
  FileCheck2,
  ChevronRight,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { Order, TimelineEntry } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface OrderTrackingProgressBarProps {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
}

interface StageConfig {
  key: Order['orderStatus'];
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  percentage: number;
  hub: string;
  defaultEtaText: string;
}

const STAGES: StageConfig[] = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    shortLabel: 'Placed',
    icon: ShoppingBag,
    percentage: 14,
    hub: 'AutoApex Digital Gateway · Payment Verified',
    defaultEtaText: 'Order logged and queued for fitment verification'
  },
  {
    key: 'CONFIRMED',
    label: 'Fitment Confirmed',
    shortLabel: 'Confirmed',
    icon: FileCheck2,
    percentage: 28,
    hub: 'AutoApex Technical Fitment Desk, Gurugram',
    defaultEtaText: 'Fitment verified against chassis database'
  },
  {
    key: 'PROCESSING',
    label: 'Quality & Packaging',
    shortLabel: 'Processing',
    icon: ShieldCheck,
    percentage: 42,
    hub: 'AutoApex Central Fulfillment Center, Sector 18',
    defaultEtaText: 'Laser dimensional scan & anti-damage check'
  },
  {
    key: 'PACKED',
    label: 'Crated & Manifested',
    shortLabel: 'Packed',
    icon: Package,
    percentage: 58,
    hub: 'AutoApex Dispatch Staging Bay #04',
    defaultEtaText: 'Crated with shockproof bubble insulation'
  },
  {
    key: 'SHIPPED',
    label: 'Dispatched & In Transit',
    shortLabel: 'In Transit',
    icon: Truck,
    percentage: 75,
    hub: 'Delhivery National Logistics Sort Center, Bilaspur NH-48',
    defaultEtaText: 'In transit via Express Line-haul logistics'
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    shortLabel: 'Out for Delivery',
    icon: Navigation,
    percentage: 90,
    hub: 'Delhivery Last-Mile Hub, New Delhi Delivery Center',
    defaultEtaText: 'Courier associate is en route to address'
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    shortLabel: 'Delivered',
    icon: CheckCircle2,
    percentage: 100,
    hub: 'Destination Address',
    defaultEtaText: 'Successfully delivered & OTP confirmed'
  }
];

export const OrderTrackingProgressBar: React.FC<OrderTrackingProgressBarProps> = ({
  order,
  onOrderUpdated
}) => {
  const { success, error } = useToast();

  const [copiedAwb, setCopiedAwb] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [autoSyncCountdown, setAutoSyncCountdown] = useState<number>(8);
  const [showTimelineDetails, setShowTimelineDetails] = useState(true);

  // Compute active stage index
  const currentStageIndex = STAGES.findIndex(s => s.key === order.orderStatus);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStage = STAGES[activeIndex];
  const progressPercent = currentStage ? currentStage.percentage : 15;

  const isDelivered = order.orderStatus === 'DELIVERED';
  const isCancelled = order.orderStatus === 'CANCELLED';

  // Copy AWB
  const handleCopyAwb = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedAwb(true);
    success('AWB Copied', `Tracking #${order.trackingNumber} copied to clipboard.`);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  // Real-time server sync
  const refreshStatus = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const updated = await api.orders.getById(order.id);
      onOrderUpdated(updated);
      setLastSyncTime(new Date());
      setAutoSyncCountdown(8);
      if (!silent) {
        success('Live Tracking Refreshed', `Carrier status synchronized with ${order.carrier}.`);
      }
    } catch (err: any) {
      if (!silent) {
        error('Sync Error', err.message || 'Could not reach carrier tracking service.');
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Step to Next Stage
  const handleAdvanceStage = async () => {
    try {
      setIsAdvancing(true);
      const updated = await api.orders.advanceTracking(order.id);
      onOrderUpdated(updated);
      setLastSyncTime(new Date());
      setAutoSyncCountdown(8);
      success('Tracking Updated!', `Shipment advanced to ${updated.orderStatus.replace(/_/g, ' ')}.`);
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not advance tracking.');
    } finally {
      setIsAdvancing(false);
    }
  };

  // Reset tracking for re-simulation
  const handleResetTracking = async () => {
    try {
      setIsAdvancing(true);
      const updated = await api.orders.resetTracking(order.id);
      onOrderUpdated(updated);
      setLastSyncTime(new Date());
      setAutoSyncCountdown(8);
      setAutoSimulate(false);
      success('Tracking Reset', 'Order reset to Confirmed for simulation.');
    } catch (err: any) {
      error('Reset Failed', err.message);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Auto-polling effect (every 8 seconds countdown)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSyncCountdown(prev => {
        if (prev <= 1) {
          refreshStatus(true);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order.id]);

  // Auto-simulation interval (if enabled, steps every 4.5s until DELIVERED)
  useEffect(() => {
    if (!autoSimulate || isDelivered || isCancelled) return;

    const simTimer = setInterval(async () => {
      try {
        const updated = await api.orders.advanceTracking(order.id);
        onOrderUpdated(updated);
        setLastSyncTime(new Date());
        if (updated.orderStatus === 'DELIVERED') {
          setAutoSimulate(false);
          success('Delivered!', 'Order has reached final destination.');
        }
      } catch (err) {
        console.error('Auto-simulation error:', err);
        setAutoSimulate(false);
      }
    }, 4500);

    return () => clearInterval(simTimer);
  }, [autoSimulate, isDelivered, isCancelled, order.id]);

  // Delivery ETA formatting
  const orderDate = new Date(order.createdAt);
  const estimatedDeliveryDate = new Date(orderDate.getTime() + 3 * 24 * 3600 * 1000);
  const formattedEta = estimatedDeliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm transition-colors duration-200">
      {/* 1. Header & Live Telemetry Beacon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-600/10 dark:text-red-500 border border-red-200 dark:border-red-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white font-display">
                  Real-Time Shipment Tracking
                </h3>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                  Live GPS Connected
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Direct carrier telemetry feed from {order.carrier}
              </p>
            </div>
          </div>
        </div>

        {/* Live Sync & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh sync button */}
          <button
            onClick={() => refreshStatus(false)}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Force refresh live tracking from carrier"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span>Sync</span>
            <span className="text-[10px] text-zinc-400 font-mono">({autoSyncCountdown}s)</span>
          </button>

          {/* Advance stage button for real-time demonstration */}
          {!isDelivered && !isCancelled && (
            <button
              onClick={handleAdvanceStage}
              disabled={isAdvancing}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Simulate dispatch / transition to next shipping milestone"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Advance Stage</span>
            </button>
          )}

          {/* Auto-simulate transit journey toggle */}
          {!isDelivered && !isCancelled && (
            <button
              onClick={() => setAutoSimulate(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                autoSimulate
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-300 dark:border-zinc-700'
              }`}
              title="Automatically advance through all transit stages in real-time"
            >
              {autoSimulate ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Simulating Live...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Auto-Run Transit</span>
                </>
              )}
            </button>
          )}

          {/* Reset button if delivered */}
          {isDelivered && (
            <button
              onClick={handleResetTracking}
              disabled={isAdvancing}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset order journey to test tracking again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Simulate Tracking</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual Progress Bar Component */}
      <div className="space-y-4">
        {/* Top Progress Bar Metrics Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-950 dark:text-white text-sm">
              {currentStage?.label || order.orderStatus}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isDelivered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900'
              }`}
            >
              {progressPercent}% FULFILLED
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
              {isDelivered ? 'Delivery Completed' : `Est. Arrival: ${formattedEta}, by 4:00 PM`}
            </span>
          </div>
        </div>

        {/* The Continuous Horizontal Visual Progress Rail */}
        <div className="relative pt-6 pb-2">
          {/* Base Track */}
          <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full overflow-hidden relative">
            {/* Active Filled Gradient Rail */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isDelivered
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Gliding Vehicle Indicator */}
          {!isCancelled && (
            <div
              className="absolute top-1 -translate-x-1/2 transition-all duration-700 ease-out z-20 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-2 border-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                  <Truck className="w-4 h-4" />
                </div>
                {/* Glowing vehicle beacon ping */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
            </div>
          )}

          {/* Milestone Step Nodes */}
          <div className="grid grid-cols-7 mt-4 gap-1 relative z-10">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isFuture = idx > activeIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center group">
                  {/* Node Circle */}
                  <div
                    className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-500/25 dark:ring-red-500/30 shadow-md shadow-red-500/40 scale-105'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}

                    {/* Live radar ring on current step */}
                    {isCurrent && !isDelivered && (
                      <span className="absolute -inset-1 rounded-full border-2 border-red-500/60 animate-ping pointer-events-none" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-2 space-y-0.5 max-w-[70px] sm:max-w-[85px]">
                    <span
                      className={`block text-[10px] sm:text-[11px] font-semibold leading-tight truncate sm:whitespace-normal ${
                        isCurrent
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : isPast
                          ? 'text-zinc-900 dark:text-zinc-200'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {stage.shortLabel}
                    </span>

                    {/* Status badge on desktop */}
                    <span className="hidden sm:inline-block text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                      {isPast ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Live Intelligence Cards (Hub Location, Courier Info, Dispatch AWB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Active Location Hub */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
              Current Location Hub
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">VERIFIED</span>
          </div>
          <p className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
            {currentStage?.hub || 'AutoApex Dispatch Hub'}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {currentStage?.defaultEtaText}
          </p>
        </div>

        {/* Card 2: Carrier AWB & Tracking Number */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <Truck className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
              Courier & AWB Number
            </span>
            <span className="text-[10px] font-mono font-semibold text-zinc-500">{order.carrier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white tracking-wide">
              {order.trackingNumber}
            </span>
            <button
              onClick={handleCopyAwb}
              className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Copy AWB number"
            >
              {copiedAwb ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Last scan updated at {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        {/* Card 3: Delivery Associate or Delivery Guarantee */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              {order.orderStatus === 'OUT_FOR_DELIVERY' ? 'Assigned Courier Rider' : 'Safe Delivery Guarantee'}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">INSURED</span>
          </div>

          {order.orderStatus === 'OUT_FOR_DELIVERY' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Vikramjit Singh</span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  OTP: 4821
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>+91 98112 44921 · Electric Delivery Van #HR-26-8812</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                Laser Fitment & Transit Insured
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                100% zero-scratch packaging with direct return if fitment diverges.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Collapsible Detailed Carrier Checkpoint Activity Feed */}
      <div className="pt-2">
        <button
          onClick={() => setShowTimelineDetails(prev => !prev)}
          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTimelineDetails ? 'rotate-90' : ''}`} />
          <span>{showTimelineDetails ? 'Hide Carrier Checkpoint Log' : 'View Full Carrier Checkpoint Log'} ({order.statusTimeline.filter(t => t.completed).length} events logged)</span>
        </button>

        {showTimelineDetails && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-3">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {order.statusTimeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                      item.completed
                        ? 'bg-emerald-600 border-white dark:border-zinc-950 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <span className={`font-bold ${item.completed ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {item.title}
                      </span>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {item.timestamp ? (
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">Pending scan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
