import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Heart,
  ShoppingBag,
  Car,
  ChevronRight,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useVehicle } from '../context/VehicleContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface ProductDetailViewProps {
  productId: string;
  onNavigateProduct: (id: string) => void;
  onCheckout: () => void;
  onOpenVehicleModal: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigateProduct,
  onCheckout,
  onOpenVehicleModal
}) => {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { selectedVehicle, checkCompatibility } = useVehicle();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<(Product & { reviews: Review[] }) | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'compatibility'>('specs');

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await api.products.getByIdOrSlug(productId);
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.thumbnail);

        const recs = await api.recommendations.getSimilar(data.id);
        setSimilar(recs);
      } catch (err) {
        console.error('Failed loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500">
        <div className="animate-pulse space-y-4 max-w-lg mx-auto">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-900 rounded-2xl" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-900 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const fitment = checkCompatibility(product);

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    setIsCartDrawerOpen(false);
    onCheckout();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Sign In Required', 'Please sign in to post a verified review.');
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const newRev = await api.reviews.create(product.id, {
        rating: reviewRating,
        title: reviewTitle || 'Excellent Quality',
        comment: reviewComment
      });

      setProduct(prev => prev ? {
        ...prev,
        reviews: [newRev, ...prev.reviews],
        reviewCount: prev.reviewCount + 1
      } : null);

      success('Review Submitted', 'Your review has been verified and posted.');
      setReviewComment('');
      setReviewTitle('');
    } catch (err: any) {
      error('Review Error', err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Contiguous Purchase Module PDP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative group shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors shadow-sm"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImage === img
                      ? 'border-red-600 shadow-md shadow-red-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span className="uppercase font-semibold tracking-wider text-red-600 dark:text-red-500">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-tight font-display">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5 text-xs">
              <div className="flex items-center text-amber-500 dark:text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-zinc-900 dark:text-white tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price Card */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-baseline justify-between shadow-sm">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-950 dark:text-white tabular-nums">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through tabular-nums">
                    ₹{product.mrp.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                Save ₹{(product.mrp - product.price).toLocaleString()} ({product.discountPercent}% OFF)
              </span>
            </div>

            <div className="text-right">
              {product.stockStatus === 'IN_STOCK' ? (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Precision Vehicle Compatibility Card */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              fitment.isCompatible
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {fitment.isCompatible ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    {fitment.isCompatible ? 'Fitment Certified' : 'Compatibility Notice'}
                  </h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    {fitment.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenVehicleModal}
                className="text-[11px] font-semibold underline text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0 cursor-pointer"
              >
                Change Car
              </button>
            </div>
          </div>

          {/* Quantity & Buy CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 px-2 py-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-zinc-900 dark:text-white tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-2.5 py-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'OUT_OF_STOCK'}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-750 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stockStatus === 'OUT_OF_STOCK'}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <span>Instant Buy with Razorpay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery & Warranty Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-850 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>Delivered in {product.deliveryDays} business days</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>{product.warranty}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>7-Day Return Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>100% Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-zinc-200 dark:border-zinc-850 pt-10">
        <div className="flex items-center gap-3 sm:gap-6 border-b border-zinc-200 dark:border-zinc-850 pb-3 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'specs'
                ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`pb-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'compatibility'
                ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Certified Vehicle Models ({product.universalFit ? 'Universal' : product.compatibility.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'reviews'
                ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === 'specs' && (
          <div className="py-6 space-y-6 max-w-4xl">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{product.description}</p>

            <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-900/60' : 'bg-white dark:bg-zinc-950'}>
                      <td className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400 w-1/3 border-b border-zinc-200 dark:border-zinc-850">{key}</td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-850">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vehicle Compatibility Rules */}
        {activeTab === 'compatibility' && (
          <div className="py-6 space-y-4 max-w-4xl">
            {product.universalFit ? (
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>This accessory is engineered with flexible or standard DIN mounts, ensuring universal fitment across all automotive sedans, SUVs, and hatchbacks.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.compatibility.map((rule, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <span className="font-bold text-zinc-950 dark:text-white block">{rule.brandName} {rule.modelName}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Years: {rule.yearStart} – {rule.yearEnd}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                      Laser Tested
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-6 space-y-8 max-w-4xl">
            {/* Write a review */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Write a Verified Review</h4>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="Review title (e.g. Perfect fit on Creta 2024)"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white"
                />

                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details regarding material quality, installation ease, and fitment..."
                  rows={3}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-red-500/20"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            </div>

            {/* Existing reviews */}
            <div className="space-y-3">
              {product.reviews?.length === 0 ? (
                <p className="text-xs text-zinc-500">No reviews yet. Be the first to leave a review!</p>
              ) : (
                product.reviews?.map(rev => (
                  <div key={rev.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-950 dark:text-white">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-500 dark:text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                        ))}
                      </div>
                    </div>
                    <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{rev.title}</h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {similar.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-850 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white font-display">
              Frequently Bought Together & Similar Fits
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigateProduct(item.id)}
                className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex gap-3 items-center shadow-sm"
              >
                <img src={item.thumbnail} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.name}</h4>
                  <span className="text-xs font-bold text-red-600 dark:text-red-500 tabular-nums">₹{item.price.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 block truncate">{item.brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
