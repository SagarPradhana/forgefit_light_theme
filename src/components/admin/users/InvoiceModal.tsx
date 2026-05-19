import { useRef, useState, useEffect } from "react";
import { Modal, GlowButton, CommonButton } from "../../ui/primitives";
import { Download, X } from "lucide-react";
import { useGymStore } from "../../../store/gymStore";
import { toast } from "../../../store/toastStore";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { DownloadAnimation } from "../../ui/ActionAnimations";

interface PaymentInvoice {
  id: string;
  user_id: string;
  username: string;
  member_id: string;
  name?: string;
  Name?: string;
  mobile: string;
  email?: string;
  amount: number;
  payment_date: number;
  payment_method: string;
  status: string;
  purchase_type: string;
  purchase_details?: any;
  created_date: number;
  updated_date: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentInvoice | null;
}

export function InvoiceModal({ isOpen, onClose, payment }: InvoiceModalProps) {
  const { publicAppConfig } = useGymStore();
  const printRef = useRef<HTMLDivElement>(null);
  const brandName = publicAppConfig?.brand_name || "ForgeFit";
  const logo = publicAppConfig?.logo_image_path || "/logo.png";
  const currency = publicAppConfig?.currency || "₹";
  const [dlStage, setDlStage] = useState<"idle" | "downloading" | "success">("idle");

  useEffect(() => {
    if (isOpen) setDlStage("idle");
  }, [isOpen]);

  const handleDownload = async () => {
    if (!printRef.current || !payment) return;
    setDlStage("downloading");
    try {
      const canvas = await htmlToImage.toCanvas(printRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${payment.id.slice(0, 8)}.pdf`);
      setDlStage("success");
      toast.success("Invoice downloaded successfully");
      setTimeout(() => setDlStage("idle"), 1500);
    } catch (err) {
      setDlStage("idle");
      toast.error("Failed to generate PDF. Try the Print option.");
    }
  };

  if (!payment) return null;

  const getPurchaseDescription = () => {
    const details = payment.purchase_details;
    if (!details) return payment.purchase_type;
    if (payment.purchase_type === "subscription" || payment.purchase_type === "renewal") {
      return details.plan_name || details.name || "Gym Subscription";
    }
    if (payment.purchase_type === "product") {
      return details.product_name || details.name || "Product Purchase";
    }
    return payment.purchase_type;
  };

  const isBusy = dlStage === "downloading";

  const modalContent = dlStage === "downloading" ? (
    <div className="flex items-center justify-center py-12">
      <DownloadAnimation stage="downloading" size={56} />
    </div>
  ) : dlStage === "success" ? (
    <div className="flex items-center justify-center py-12">
      <DownloadAnimation stage="success" size={56} />
    </div>
  ) : (
    <div ref={printRef} className="max-w-2xl mx-auto bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt={brandName} className="w-12 h-12 rounded-lg bg-white object-contain p-1" />
          <div>
            <h2 className="text-xl font-bold text-white">{brandName}</h2>
            <p className="text-xs text-white/80">Official Invoice</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-xs">Invoice ID</p>
          <p className="text-white font-mono text-sm font-semibold">#{payment.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Billed To</p>
            <p className="font-semibold text-gray-900">{payment.name || payment.Name || "N/A"}</p>
            <p className="text-xs text-gray-500">#{payment.member_id || payment.username || "N/A"}</p>
            <p className="text-xs text-gray-500">{payment.mobile}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Invoice Details</p>
            <p className="text-sm text-gray-900">
              <span className="text-gray-500">Date: </span>
              {new Date(payment.payment_date * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-sm text-gray-900">
              <span className="text-gray-500">Time: </span>
              {new Date(payment.payment_date * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === "paid" ? "bg-green-100 text-green-700" :
              payment.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            }`}>{payment.status}</span>
          </div>
        </div>
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="text-left py-2.5 px-4 text-xs font-semibold rounded-l-lg">Description</th>
              <th className="text-right py-2.5 px-4 text-xs font-semibold">Method</th>
              <th className="text-right py-2.5 px-4 text-xs font-semibold rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4">
                <p className="font-semibold text-gray-900 capitalize">{getPurchaseDescription()}</p>
                <p className="text-xs text-gray-500">{payment.purchase_type}</p>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-sm font-medium text-gray-600 uppercase">{payment.payment_method}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-lg font-bold text-gray-900">{currency}{payment.amount}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="bg-gray-50 p-4 rounded-lg flex justify-end">
          <div className="w-48 flex justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold text-orange-500">{currency}{payment.amount}</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Thank you for your payment &bull; {brandName}</p>
          <p className="text-[10px] text-gray-300 mt-1">
            Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Payment Invoice"
      footer={
        <div className="flex gap-3">
          <CommonButton variant="ghost" onClick={onClose} disabled={isBusy}>
            <X size={18} />
          </CommonButton>
          <GlowButton onClick={handleDownload} disabled={isBusy}>
            {dlStage === "downloading" ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : dlStage === "success" ? (
              <span className="flex items-center gap-1.5"><Download size={18} /> Done</span>
            ) : (
              <span className="flex items-center gap-1.5"><Download size={18} /> Download PDF</span>
            )}
          </GlowButton>
        </div>
      }
    >
      {modalContent}
    </Modal>
  );
  }