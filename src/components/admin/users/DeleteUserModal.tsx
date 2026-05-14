import { DeleteConfirmationModal } from "../../common/DeleteConfirmationModal";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DeleteUserModal = ({ isOpen, onClose, onConfirm, isProcessing }: DeleteUserModalProps) => {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="User Termination"
      description="This user profile and all associated data will be permanently purged from the master database. This action is irreversible."
      confirmLabel="Submit"
      isProcessing={isProcessing}
    />
  );
};
