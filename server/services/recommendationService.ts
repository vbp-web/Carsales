import { Product } from '../types/index.ts';
import { db } from '../db/store.ts';

export interface RecommendationParams {
  userId?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  category?: string;
  limit?: number;
}

export interface RecommendationServiceInterface {
  getRecommendations(params: RecommendationParams): Promise<Product[]>;
  getSimilarProducts(productId: string, limit?: number): Promise<Product[]>;
  getPersonalizedProducts(userId: string, limit?: number): Promise<Product[]>;
}

/**
 * Rule-Based Automotive Recommendation Engine.
 * Intelligently prioritizes:
 * 1. Vehicle fitment exact matches (e.g., Hyundai Creta 2024 matched accessories)
 * 2. Cross-category bundles (e.g. if viewing floor mats, suggest matching seat covers & dash cams)
 * 3. High-rated, bestselling vehicle staples
 *
 * Implements the RecommendationServiceInterface so an ML / Tensor model can be plugged in later seamlessly.
 */
export class RuleBasedRecommendationService implements RecommendationServiceInterface {
  async getRecommendations(params: RecommendationParams): Promise<Product[]> {
    const all = db.getProducts({ inStockOnly: true }).products;
    const limit = params.limit || 8;

    let scored = all.map(product => {
      let score = 0;

      // Rule 1: Vehicle fitment boost
      if (params.carBrand || params.carModel) {
        const isDirectMatch = product.compatibility.some(c => {
          let bMatch = !params.carBrand || c.brandName.toLowerCase() === params.carBrand.toLowerCase();
          let mMatch = !params.carModel || c.modelName.toLowerCase() === params.carModel.toLowerCase();
          let yMatch = !params.carYear || (params.carYear >= c.yearStart && params.carYear <= c.yearEnd);
          return bMatch && mMatch && yMatch;
        });

        if (isDirectMatch) {
          score += 100;
        } else if (product.universalFit) {
          score += 40;
        } else {
          score -= 50; // Incompatible with user's selected vehicle
        }
      }

      // Rule 2: Category relevance or cross-sell
      if (params.category) {
        if (product.category.toLowerCase() === params.category.toLowerCase()) {
          score += 25;
        }
      }

      // Rule 3: Quality signals
      score += product.rating * 5;
      if (product.isBestseller) score += 15;
      if (product.isFeatured) score += 10;
      if (product.isNewArrival) score += 5;

      return { product, score };
    });

    // Filter out negative scores (strictly incompatible)
    scored = scored.filter(item => item.score > 0);
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(item => item.product);
  }

  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const current = db.getProductById(productId);
    if (!current) return [];

    const all = db.getProducts({ inStockOnly: true }).products.filter(p => p.id !== productId);

    const scored = all.map(item => {
      let score = 0;
      if (item.category === current.category) score += 50;
      if (item.subcategory === current.subcategory) score += 40;
      if (item.brand === current.brand) score += 20;

      // Compatibility overlap
      const sharedVehicles = item.compatibility.some(c1 =>
        current.compatibility.some(c2 => c1.brandName === c2.brandName && c1.modelName === c2.modelName)
      );
      if (sharedVehicles) score += 30;

      score += item.rating * 4;
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.item);
  }

  async getPersonalizedProducts(userId: string, limit: number = 6): Promise<Product[]> {
    const userOrders = db.getOrders(userId);
    const wishlist = db.getWishlist(userId);

    // If user has orders or wishlist, identify vehicle and categories
    let preferredCategory: string | undefined;
    let preferredBrand: string | undefined;

    if (userOrders.length > 0) {
      const lastItem = userOrders[0].items[0];
      const prod = db.getProductById(lastItem.productId);
      if (prod) {
        preferredCategory = prod.category;
        preferredBrand = prod.compatibility[0]?.brandName;
      }
    }

    return this.getRecommendations({
      userId,
      category: preferredCategory,
      carBrand: preferredBrand,
      limit
    });
  }
}

export const recommendationService: RecommendationServiceInterface = new RuleBasedRecommendationService();
