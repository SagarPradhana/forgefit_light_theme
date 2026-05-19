import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminProductService } from "../../../services/adminProductService";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";
import { Package, Tag, IndianRupee, PackageOpen, Image, FileText } from "lucide-react";
import { SuccessAnimation } from "../../ui/ActionAnimations";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProductId: string | null;
  productForm: {
    name: string;
    category: string;
    price: string;
    stock: string;
    unit: string;
    image: string;
    description: string;
  };
  setProductForm: (form: any) => void;
  currencySymbol: string;
  onSuccess: () => void;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export function ProductModal({
  isOpen,
  onClose,
  editProductId,
  productForm,
  setProductForm,
  currencySymbol,
  onSuccess
}: ProductModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { setSaveSuccess(false); }, [isOpen]);

  const handleSubmit = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!productForm.price || Number(productForm.price) < 0) {
      toast.error("Product price must be 0 or greater");
      return;
    }
    if (productForm.stock === "" || Number(productForm.stock) < 0) {
      toast.error("Stock count must be 0 or greater");
      return;
    }

    setSaving(true);

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      stock_count: Number(productForm.stock),
      unit: productForm.unit,
      image_url: productForm.image || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=400",
      description: productForm.description
    };
    try {
      if (editProductId) {
        await adminProductService.updateProduct(editProductId, payload);
      } else {
        await adminProductService.createProduct(payload);
      }
      setSaveSuccess(true);
      toast.success(editProductId ? "Product updated successfully" : "New product added to catalog");
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      toast.error("Failed to save product");
      setSaving(false);
    }
  };

  const modalContent = saveSuccess ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <SuccessAnimation show={true} size={72} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg font-semibold text-gray-900"
      >
        {editProductId ? "Product Updated!" : "Product Added!"}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
    </motion.div>
  ) : (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Details</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
            <input className={inp} placeholder="Enter product name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className={sel} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
              <option value="">Select a category</option>
              <option value="supplements">Supplements</option>
              <option value="equipment">Equipment</option>
              <option value="apparel">Apparel</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <PackageOpen size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currencySymbol}) <span className="text-red-500">*</span></label>
            <input className={inp} type="text" placeholder="0"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count <span className="text-red-500">*</span></label>
            <input className={inp} type="text" placeholder="0"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select className={sel} value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}>
              <option value="">Select unit</option>
              <option value="piece">Piece</option>
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="l">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="pack">Pack</option>
              <option value="bottle">Bottle</option>
              <option value="box">Box</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Media</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input className={inp} placeholder="https://example.com/image.jpg"
            value={productForm.image}
            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
          <textarea className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all resize-none h-24"
            placeholder="Describe your product"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editProductId ? "Edit Product" : "Add Product"}
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</GlowButton>
          <GlowButton onClick={handleSubmit} disabled={saving}>
            <ButtonLoader label="Save Product" loadingLabel="Saving..." loading={saving} />
          </GlowButton>
        </>
      }
    >
      {modalContent}
    </Modal>
  );
}
