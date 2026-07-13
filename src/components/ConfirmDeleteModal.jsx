export default function ConfirmDeleteModal({ itemName, onCancel, onConfirm, isDeleting }) {
  return (
    <>
      <div className="glass" onClick={onCancel}></div>
      <div className="display confirm-delete-modal">
        <h3 className="display-name">Delete "{itemName}"?</h3>
        <p className="display-description">
          This will permanently remove this item from the menu. This action cannot be undone.
        </p>
        <div className="confirm-actions">
          <button type="button" className="toggle-button cancel-button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="toggle-button confirm-delete-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}