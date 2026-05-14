import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  GlassCard, 
  SectionTitle, 
  Skeleton, 
  EmptyState 
} from "../../components/ui/primitives";
import { Search } from "lucide-react";
import { appProductService, type AppProductResponse } from "../../services/appProductService";
import { ProductCard } from "../ProductCard";

export function UserProducts() {
  const { t } = useTranslation();
  
  const [fetchedProducts, setFetchedProducts] = useState<AppProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCategories, setProductCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await appProductService.getProducts({
        search: productSearch || undefined,
        category: productCategory || undefined,
        is_deleted: false,
        count: 100,
        offset: 0,
      });
      if (res && res.data) {
        setFetchedProducts(res.data);
        const cats = [...new Set(res.data.map((p) => p.category).filter(Boolean))];
        setProductCategories(cats as string[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  }, [productSearch, productCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle
          title={t("products")}
          subtitle="Fuel your transformation with premium supplements"
        />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Search catalog..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {productCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
        </div>
      ) : fetchedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fetchedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="Catalog Empty" hint="We're restacking our inventory. Check back soon for premium performance fuel." />
      )}
    </div>
  );
}
