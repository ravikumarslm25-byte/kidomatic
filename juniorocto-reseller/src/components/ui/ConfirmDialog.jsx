import Modal from "./Modal";
import Button from "./Button";
export default function ConfirmDialog({ open, onClose, onConfirm, title = "Delete record?", message = "This can't be undone.", confirmLabel = "Delete" }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button></>}>
      <p className="text-sm text-navy/70">{message}</p>
    </Modal>
  );
}
