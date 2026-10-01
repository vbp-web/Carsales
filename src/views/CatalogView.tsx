import React, { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Car
} from 'lucide-react';
import { Product, Category, CarBrand } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { useVehicle } from '../context/VehicleContext.tsx';

interface CatalogViewProps {
  initialParams?: Record<string, any>;
  onNavigateProduct: (id: string) => void;
  onOpenVehicleModal: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialParams = {},
  onNavigateProduct,
  onOpenVehicleModal
}) => {
  const { selectedVehicle } = useVehicle();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(initialParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterBrand, setFilterBrand] = useState(initialParams.brand || '');
  const [carBrand, setCarBrand] = useState(initialParams.carBrand || selectedVehicle?.brand || '');
  const [carModel, setCarModel] = useState(initialParams.carModel || selectedVehicle?.model || '');
  const [carYear, setCarYear] = useState<number | undefined>(initialParams.carYear || selectedVehicle?.year || undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(initialParams.sort || 'relevance');

  // Load initial options
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, carBrandsList] = await Promise.all([
          api.categories.getAll(),
          api.cars.getBrands()
        ]);
        setCategories(cats);
        setBrands(carBrandsList);
      } catch (err) {
        console.error('Failed loading filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await api.products.getAll({
          search,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          brand: filterBrand,
          carBrand,
          carModel,
          carYear,
          minPrice,
          maxPrice,
          rating: minRating,
          inStockOnly,
          sort,
          page,
          limit: 12
        });
        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [
    search,
    selectedCategory,
    selectedSubcategory,
    filterBrand,
    carBrand,
    carModel,
    carYear,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sort,
    page
  ]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFilterBrand('');
    setCarBrand('');
    setCarModel('');
    setCarYear(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setInStockOnly(false);
    setSort('relevance');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(selectedSubcategory) ||
    Boolean(filterBrand) ||
    Boolean(carBrand) ||
    Boolean(carModel) ||
    Boolean(carYear) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Breadcrumbs & Active Vehicle Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white font-display">
            Automotive Accessories Catalog
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Showing <strong className="text-zinc-900 dark:text-white tabular-nums">{total}</strong> compatible parts & accessories
          </p>
        </div>

        {/* Selected Vehicle Badge */}
        <div className="flex items-center gap-3">
          {carBrand && carModel ? (
            <div className="flex items-center gap-2 p-2 px-3 bg-emerald-50 dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-xs shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-zinc-500 block">Filtered for Vehicle:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  {carBrand} {carModel} {carYear ? `(${carYear})` : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setCarBrand('');
                  setCarModel('');
                  setCarYear(undefined);
                }}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 ml-1"
                title="Remove vehicle filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenVehicleModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Car className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
              <span>Select car to verify fitment</span>
            </button>
          )}

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-xl shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl shadow-sm">
        {/* Search inside catalog */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search parts, brand, SKU..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg pl-8 pr-4 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Sort By:</label>
          <select
            value={sort}
            onChange={e => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="relevance">Relevance & Match</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
            <option value="discount">Biggest Discount</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                Refine Selection
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    !selectedCategory ? 'bg-zinc-900 text-white dark:bg-zinc-800 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setSelectedSubcategory('');
                      setPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCategory.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-zinc-900 text-white dark:bg-zinc-800 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-zinc-400 tabular-nums">({c.productCount || 10})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            {selectedCategory && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block">Subcategory</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {categories
                    .find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())
                    ?.subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubcategory(selectedSubcategory === sub ? '' : sub);
                          setPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                          selectedSubcategory === sub
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-medium'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={e => {
                    setMinPrice(e.target.value ? Number(e.target.value) : undefined);
                    setPage(1);
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={e => {
                    setMaxPrice(e.target.value ? Number(e.target.value) : undefined);
                    setPage(1);
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-zinc-300 text-red-600 focus:ring-red-500 bg-white"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 animate-pulse shadow-sm">
                  <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">No accessories matched your filter</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Try clearing selected vehicle or adjusting category parameters to browse universal fitment accessories.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-red-500/20"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onNavigateProduct(product.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 rounded-lg text-zinc-900 dark:text-white font-medium cursor-pointer shadow-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 rounded-lg text-zinc-900 dark:text-white font-medium cursor-pointer shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div onClick={() => setMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-zinc-950 p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-zinc-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category list */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block mb-1">Category</span>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setMobileFilterOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 text-xs rounded ${!selectedCategory ? 'bg-zinc-900 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded ${selectedCategory === c.name ? 'bg-zinc-900 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                clearFilters();
                setMobileFilterOpen(false);
              }}
              className="w-full py-2 bg-zinc-900 dark:bg-zinc-800 text-xs text-white font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
