import { useState, useEffect } from "react";
import { useGymStore } from "../../store/gymStore";
import { useTranslation } from "react-i18next";
import { 
  GlassCard, 
  GlowButton, 
  SectionTitle, 
  Skeleton, 
  Table, 
  EmptyState,
  Pagination
} from "../../components/ui/primitives";
import { Search, Edit2, Trash2 } from "lucide-react";
import { adminProductService, type ProductResponse } from "../../services/adminProductService";
import { getCurrencySymbol } from "../../utils/currency";
import { toast } from "../../store/toastStore";
import { DeleteConfirmationModal } from "../../components/common/DeleteConfirmationModal";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../utils/formUtils";
import { ProductModal } from "../../components/admin/products/ProductModal";

export function AdminProducts() {
  const { t } = useTranslation();
  const { appConfig } = useGymStore();
  const currencySymbol = getCurrencySymbol(appConfig?.currency || "INR");

  const [fetchedProducts, setFetchedProducts] = useState<ProductResponse[]>([]);
  const [productsMeta, setProductsMeta] = useState({
    page_no: 1,
    total_count: 0,
    page_size: 10,
    has_next: false,
    has_previous: false
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: any } | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "Supplements",
    price: "",
    stock: "",
    unit: "kg",
    image: "",
    description: ""
  });

  const fetchProducts = async (p = productsMeta.page_no || 1, search = productSearch, category = productCategory) => {
    setProductsLoading(true);
    try {
      const currentPage = Number(p) || 1;
      const pageSize = Number(productsMeta.page_size) || 10;
      const offset = (currentPage - 1) * pageSize;
      const res = await adminProductService.getProducts({
        count: pageSize,
        offset,
        search,
        category: category !== "All" ? category : undefined
      });
      if (res && res.data) {
        const totalCount = Number(
          res.total_count ?? res.totalcount ?? res.pagination?.total_count ?? res.count ?? res.data.length ?? 0
        );
        setFetchedProducts(res.data);
        setProductsMeta({
          page_no: Math.floor(offset / pageSize) + 1,
          total_count: totalCount,
          page_size: pageSize,
          has_next: offset + pageSize < totalCount,
          has_previous: offset > 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1), 300);
    return () => clearTimeout(timer);
  }, [productSearch, productCategory]);

  const lastPage = Math.ceil(productsMeta.total_count / productsMeta.page_size) || 1;

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <SectionTitle
          title={t("products")}
          subtitle={t("productsSubtitle") || "Manage gym merchandise, supplements, and equipment stock."}
        />
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder={t("search") || "Search products..."}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 transition"
            />
          </div>
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 transition cursor-pointer"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
          >
            <option value="All" className="bg-[var(--bg-card)]">{t("allCategories") || "All Categories"}</option>
            <option value="Supplements" className="bg-[var(--bg-card)]">Supplements</option>
            <option value="Apparel" className="bg-[var(--bg-card)]">Apparel</option>
            <option value="Equipment" className="bg-[var(--bg-card)]">Equipment</option>
            <option value="Accessories" className="bg-[var(--bg-card)]">Accessories</option>
          </select>
          <GlowButton
            className="w-full md:w-auto justify-center"
            onClick={() => {
              setProductForm({ name: "", category: "Supplements", price: "", stock: "", unit: "kg", image: "", description: "" });
              setEditProduct(null);
              setProductModalOpen(true);
            }}
          >
            {t("addProduct") || "Add Product"}
          </GlowButton>
        </div>
      </div>

      {productsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : fetchedProducts.length > 0 ? (
        <>
          <Table
            columns={[
              {
                key: "info",
                label: "Product Info",
                render: (p) => (
                  <div className="flex items-center gap-3 text-left">
                    <img src={p.image_url || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=400"} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-[var(--border-subtle)]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)] tracking-tight uppercase text-xs">{p.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">{p.description}</span>
                    </div>
                  </div>
                )
              },
              {
                key: "category",
                label: "Category",
                render: (p) => <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{p.category}</span>
              },
              {
                key: "price",
                label: "Price",
                render: (p) => <span className="text-emerald-600 font-bold">{currencySymbol}{p.price}</span>
              },
              {
                key: "stock",
                label: "Stock",
                render: (p) => (
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-bold ${p.stock_count < 10 ? 'text-red-600' : 'text-indigo-600'}`}>{p.stock_count}</span>
                    {p.stock_count < 10 && <span className="text-[8px] font-bold uppercase text-red-500/80 animate-pulse">{t("lowStock")}</span>}
                  </div>
                )
              },
              {
                key: "actions",
                label: "Actions",
                render: (p) => (
                  <div className="flex gap-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-700 transition-transform hover:scale-125"
                      onClick={() => {
                        setProductForm({
                          name: p.name,
                          category: p.category,
                          price: p.price.toString(),
                          stock: p.stock_count.toString(),
                          unit: p.unit || "kg",
                          image: p.image_url || "",
                          description: p.description || ""
                        });
                        setEditProduct(p.id);
                        setProductModalOpen(true);
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700 transition-transform hover:scale-125"
                      onClick={() => {
                        setDeleteTarget({ type: "product", id: p.id });
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              }
            ]}
            data={fetchedProducts}
          />

          <Pagination
            currentPage={productsMeta.page_no}
            totalPages={lastPage}
            hasPrev={productsMeta.has_previous}
            hasNext={productsMeta.has_next}
            onPrev={() => fetchProducts(productsMeta.page_no - 1)}
            onNext={() => fetchProducts(productsMeta.page_no + 1)}
          />
        </>
      ) : (
        <EmptyState
          title={t("registryVoid")}
          hint={productSearch ? t("noEquipMatch", { search: productSearch }) : t("initInventory")}
        />
      )}

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editProductId={editProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        currencySymbol={currencySymbol}
        onSuccess={() => fetchProducts(1)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen && deleteTarget?.type === "product"}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (deleteTarget && deleteTarget.type === "product") {
            try {
              await adminProductService.deleteProduct(deleteTarget.id);
              toast.success("Inventory item terminated successfully");
              fetchProducts(productsMeta.page_no);
            } catch (err) {
              toast.error("Termination failed");
            }
          }
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title={t("inventoryPurge")}
        description={t("inventoryPurgeDesc")}
        confirmLabel={t("submit")}
      />
    </GlassCard>
  );
}
