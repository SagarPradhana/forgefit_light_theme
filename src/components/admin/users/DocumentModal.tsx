import { useState, useEffect } from "react";
import { FileText, Upload, Trash2, Loader2, FolderOpen, Plus, CheckCircle2 } from "lucide-react";
import { Modal, CommonButton } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { useMutation } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../utils/url";
import { UploadAnimation } from "../../ui/ActionAnimations";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  docUploading: string | null;
  setDocUploading: (val: string | null) => void;
  onDeleteDoc: (docType: string, docUrl: string) => void;
  onRefresh?: () => void;
}

export const DocumentModal = ({
  isOpen,
  onClose,
  selectedUser,
  docUploading,
  setDocUploading,
  onDeleteDoc,
  onRefresh,
}: DocumentModalProps) => {
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const { mutate: upload } = useMutation("upload", {
    onSuccess: () => {
      setDocUploading(null);
      setCacheBuster(Date.now());
      if (onRefresh) onRefresh();
    },
    onError: () => {
      setDocUploading(null);
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => setShowSuccess(null), 1500);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;
    const maxSize = fileType === "identity_proof" ? 150 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum allowed is ${fileType === "identity_proof" ? "150KB" : "2MB"}`);
      return;
    }
    setDocUploading(fileType);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await upload(`${API_ENDPOINTS.ADMIN.USER_UPLOAD(selectedUser.id)}?file_type=${fileType}`, formData);
      setShowSuccess(fileType);
    } catch (error) {
      setDocUploading(null);
    }
  };

  const isUploadingFile = (type: string) => docUploading === type;
  const isSuccess = (type: string) => showSuccess === type;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Documents"
      footer={
        <div className="flex justify-end">
          <CommonButton onClick={onClose} variant="secondary">Done</CommonButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Profile */}
        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="relative">
            <div className="h-16 w-16 rounded-xl bg-white border-2 border-orange-200 overflow-hidden flex items-center justify-center">
              {docUploading === 'profile' ? (
                <Loader2 className="animate-spin text-orange-500" size={20} />
              ) : (selectedUser?.profile_image_path || selectedUser?.metadata?.profile_image_path) ? (
                <img src={`${selectedUser.profile_image_path || selectedUser.metadata.profile_image_path}?v=${cacheBuster}`} className="h-full w-full object-cover" alt="" />
              ) : (
                <span className="text-xl font-bold text-gray-400 uppercase">{selectedUser?.name?.charAt(0)}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 h-7 w-7 bg-orange-500 rounded-lg border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-orange-600 transition-colors">
              <Upload size={12} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
            </label>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{selectedUser?.name}</h3>
            <p className="text-xs text-gray-500">{selectedUser?.email || selectedUser?.mobile}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* ID Proof */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-gray-900">Identity Proof</span>
              </div>
              <span className="text-[10px] font-medium text-gray-400 uppercase">Required</span>
            </div>
            <p className="text-xs text-gray-500">Government ID, Passport, or DL</p>
            {(selectedUser?.identity_proof_image_path || selectedUser?.metadata?.identity_proof_image_path) ? (
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-700">Uploaded</span>
                </div>
                <div className="flex gap-1">
                  <a href={selectedUser.identity_proof_image_path || selectedUser.metadata.identity_proof_image_path} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-orange-500 transition"><Upload size={12} className="rotate-180" /></a>
                  <button onClick={() => onDeleteDoc('identity_proof', selectedUser.identity_proof_image_path || selectedUser.metadata.identity_proof_image_path)} className="p-1.5 text-red-300 hover:text-red-500 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition">
                {docUploading === 'identity_proof' ? <Loader2 className="animate-spin text-orange-500" size={16} /> : <Plus className="text-gray-400" size={20} />}
                <span className="text-[10px] font-medium text-gray-500 mt-1">Upload ID</span>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'identity_proof')} />
              </label>
            )}
          </div>

          {/* Archive Files */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-emerald-500" />
                <span className="text-sm font-medium text-gray-900">Archive Files</span>
              </div>
              <span className="text-[10px] font-medium text-gray-400 uppercase">Optional</span>
            </div>
            <p className="text-xs text-gray-500">Medical certs, legal documents</p>
            <div className="flex flex-col gap-1.5">
              {(selectedUser?.other_docs_path || selectedUser?.metadata?.other_docs_path)?.map((doc: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-600 truncate">Document {i + 1}</span>
                  <button onClick={() => onDeleteDoc('other', doc)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
              {(selectedUser?.other_docs_path?.length || selectedUser?.metadata?.other_docs_path?.length || 0) < 3 && (
                <label className="flex items-center justify-center p-2 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer text-emerald-500 hover:text-emerald-600 transition">
                  <Plus size={16} />
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'other')} />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
