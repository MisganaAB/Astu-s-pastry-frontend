export default function ErrorModal({ message, onOk }) {
  return (
    <>
      <div className="glass" onClick={onOk}></div>
      <div className="display error-modal" role="alertdialog" aria-modal="true">
        <h3 className="display-name">Something went wrong</h3>
        <p className="display-description">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="toggle-button" onClick={onOk}>
            OK
          </button>
        </div>
      </div>
    </>
  );
}