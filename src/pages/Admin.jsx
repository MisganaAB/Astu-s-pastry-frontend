import { useState } from "react";
import AdminMenuList from "../components/AdminMenuList";
import Header from "../components/Header";
import ErrorModal from "../components/ErrorModal";
import { addMenuItem, editMenuItem } from "../api/menuApi";
import { useMenu } from "../context/MenuContext";

const emptyForm = {
  image: "",
  name: "",
  category: "",
  description: "",
  price: "",
};

export default function Admin() {
  const [insertVisible, setInsertVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const { refreshMenu, applyItemUpsert, rollbackMenu } = useMenu();

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    // allow mobile locales that use comma as decimal separator
    if (field === "price" && typeof value === "string") {
      value = value.replace(/,/g, ".");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setInsertVisible(true);
  };

  const openEditForm = (item) => {
    if (!item) return;
    setEditingId(item.id);
    setForm({
      image: item.image || "",
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      price: String(item.price ?? ""),
    });
    setInsertVisible(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please choose a category.");
      return;
    }

    const payload = {
      category: form.category,
      name: form.name,
      price: Number(form.price),
      description: form.description,
      image: form.image,
    };

    // Optimistically show the change right away.
    const optimisticItem = {
      id: editingId || `temp-${Date.now()}`,
      ...payload,
    };
    const snapshot = applyItemUpsert(optimisticItem);

    setInsertVisible(false);
    setForm(emptyForm);
    setEditingId(null);
    setSubmitting(true);

    try {
      const saved = editingId
        ? await editMenuItem(editingId, payload)
        : await addMenuItem(payload);

      // Replace the optimistic item with the real server-confirmed one (real id, etc.)
      applyItemUpsert(saved);
    } catch (err) {
      rollbackMenu(snapshot);
      setSaveErrorMessage(
        err.message || "Unable to save item. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleErrorOk = async () => {
    setSaveErrorMessage("");
    await refreshMenu(); // guarantee state matches the server after a failure
  };

  return (
    <>
      <Header />
      <AdminMenuList onEditRequest={openEditForm} />
      <button
        onClick={openAddForm}
        className="add-item"
        type="button"
        aria-label="Add menu item"
      >
        +
      </button>

      {insertVisible && (
        <>
          <div className="glass" onClick={() => setInsertVisible(false)}></div>
          <div
            className="display add-item-modal"
            role="dialog"
            aria-modal="true"
          >
            <form className="add-item-form" onSubmit={handleSubmit}>
              <h3 className="display-name">
                {editingId ? "Edit menu item" : "Add menu item"}
              </h3>
              <label htmlFor="image-link">Image Link Address:</label>
              <input
                id="image-link"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Image Link"
                className="admin-input"
                value={form.image}
                onChange={handleChange("image")}
                required
              />
              <hr />
              <label htmlFor="admin-input">Name:</label>
              <input
                type="text"
                placeholder="burger..."
                className="admin-input"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="admin-input"
                value={form.category}
                onChange={handleChange("category")}
                required
              >
                <option value="">Category</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Pizza">Pizza</option>
                <option value="Burger">Burger</option>
                <option value="Mexican">Mexican</option>
                <option value="Beverage">Beverage</option>
                <option value="Juice">Juice</option>
                <option value="Desserts">Desserts</option>
              </select>
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                placeholder="Price..."
                className="admin-input"
                value={form.price}
                onChange={handleChange("price")}
                required
                min="0"
                step="0.01"
              />
              <label htmlFor="desc-input">Description</label>
              <textarea
                id="desc-input"
                placeholder="Description..."
                className="admin-input"
                value={form.description}
                onChange={handleChange("description")}
              />
              {error ? <p className="admin-error-text">{error}</p> : null}
              <div className="form-action">
                <button
                  className="toggle-button admin-submit-btn"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Submit"}
                </button>
                <button
                  onClick={() => setInsertVisible(false)}
                  type="button"
                  className="cancel"
                  aria-label="Close form"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {saveErrorMessage && (
        <ErrorModal message={saveErrorMessage} onOk={handleErrorOk} />
      )}
    </>
  );
}
