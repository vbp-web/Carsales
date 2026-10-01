import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Lock,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Address, Order } from '../types/index.ts';
import { RazorpayModal } from '../components/checkout/RazorpayModal.tsx';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateHome: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onOrderSuccess, onNavigateHome }) => {
  const { items, subtotal, discount, couponCode, tax, shipping, total, clearCart } = useCart();
  const { user, addresses, createAddress, quickLoginDemo } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || (addresses[0]?.id ?? '')
  );

  // New address state
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
  const [newAddrName, setNewAddrName] = useState(user?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '+91 98765 43210');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrApartment, setNewAddrApartment] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Payment Modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrLine1 || !newAddrCity || !newAddrState || !newAddrPincode) {
      error('Required Fields', 'Please fill all address fields.');
      return;
    }

    try {
      const created = await createAddress({
        name: newAddrName,
        phone: newAddrPhone,
        addressLine1: newAddrLine1,
        apartment: newAddrApartment,
        city: newAddrCity,
        state: newAddrState,
        pincode: newAddrPincode,
        country: 'India',
        isDefault: true
      });
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
    } catch (err: any) {
      error('Address Error', err.message);
    }
  };

  const handleRazorpaySuccess = async (paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    method: string;
  }) => {
    setIsRazorpayModalOpen(false);
    setSubmittingOrder(true);

    try {
      const orderPayload = {
        items: items.map(i => ({
          productId: i.productId,
          name: i.product?.name,
          sku: i.product?.sku,
          image: i.product?.thumbnail || i.product?.images?.[0],
          price: i.product?.price,
          quantity: i.quantity,
          vehicleCompatibility: i.selectedVehicle
            ? `${i.selectedVehicle.brand} ${i.selectedVehicle.model} (${i.selectedVehicle.year})`
            : 'Universal Fitment'
        })),
        shippingAddress: selectedAddress,
        subtotal,
        discount,
        couponCode: couponCode || undefined,
        tax,
        shipping,
        total,
        paymentMethod: paymentDetails.method,
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId
      };

      const createdOrder = await api.orders.create(orderPayload);
      await clearCart();
      success('Order Placed!', `Your order ${createdOrder.orderNumber} has been verified.`);
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      error('Order Confirmation Failed', err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your cart is empty</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Add accessories from our catalog before checking out.</p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-500/20"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Steps Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white font-display">Secure Checkout</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Encrypted 256-bit Razorpay Payment Gateway</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-red-600 dark:text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Delivery Address</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-red-600 dark:text-red-500 font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Review & Payment</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Steps + Sticky Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {!user && (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-zinc-900 dark:text-zinc-300 font-semibold">Checking out as Guest or Demo</p>
                <p className="text-[11px] text-zinc-500">Sign in to save address & view historical tracking</p>
              </div>
              <button
                type="button"
                onClick={() => quickLoginDemo('CUSTOMER')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                Quick Customer Sign In
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Address List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-500" />
                    Select Shipping Destination
                  </h3>
                  {!showNewAddressForm && (
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Address
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20 text-zinc-900 dark:text-zinc-100 shadow-md shadow-red-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-950 dark:text-white">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-300">{addr.addressLine1} {addr.apartment}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Address Form Modal/Panel */}
              {showNewAddressForm && (
                <form onSubmit={handleCreateAddress} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">New Shipping Address</h4>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newAddrName}
                        onChange={e => setNewAddrName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={newAddrPhone}
                        onChange={e => setNewAddrPhone(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newAddrLine1}
                      onChange={e => setNewAddrLine1(e.target.value)}
                      placeholder="House/Plot No, Street, Landmark"
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">City</label>
                      <input
                        type="text"
                        value={newAddrCity}
                        onChange={e => setNewAddrCity(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">State</label>
                      <input
                        type="text"
                        value={newAddrState}
                        onChange={e => setNewAddrState(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Pincode</label>
                      <input
                        type="text"
                        value={newAddrPincode}
                        onChange={e => setNewAddrPincode(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Save & Use Address
                  </button>
                </form>
              )}

              {/* Continue Button */}
              {selectedAddress && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
                >
                  <span>Continue to Order Review & Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Back to Address */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Delivery Address</span>
              </button>

              {/* Selected Destination Card */}
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-1 shadow-sm">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Delivering To</span>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedAddress?.name} ({selectedAddress?.phone})</p>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedAddress?.addressLine1}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
              </div>

              {/* Itemized Review List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Package Contents ({items.length} Accessories)
                </h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-center justify-between text-xs gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.product?.thumbnail} alt="" className="w-12 h-12 rounded object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-transparent" />
                        <div>
                          <h4 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.product?.name}</h4>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">
                            {item.selectedVehicle ? `Fit: ${item.selectedVehicle.brand} ${item.selectedVehicle.model}` : 'Fitment Certified'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-zinc-950 dark:text-white tabular-nums">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Trigger CTA */}
              <div className="p-5 bg-gradient-to-r from-red-50 to-white dark:from-red-950/40 dark:to-zinc-900 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Razorpay Secure Payment</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Pay securely via UPI (GPay/PhonePe), Cards, or Net Banking</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(true)}
                  disabled={submittingOrder}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-600/20 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{total.toLocaleString()} with Razorpay</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Savings ({couponCode})</span>
                  <span className="tabular-nums">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18% Integrated Automotive Tax)</span>
                <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delhivery Express Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">
                  {shipping === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Payable</span>
                <span className="text-lg text-red-600 dark:text-red-500 tabular-nums">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Fitment Compatibility Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Dispatched within 24 hours from warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Hassle-free 7-day fitment return window</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Simulation Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        amount={total}
        customerName={selectedAddress?.name || user?.name || 'Customer'}
        customerEmail={user?.email || 'customer@example.com'}
        onSuccess={handleRazorpaySuccess}
        onClose={() => setIsRazorpayModalOpen(false)}
      />
    </div>
  );
};
