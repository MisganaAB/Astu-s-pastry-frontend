import { useState, useEffect, useRef } from "react";
import AdminMenuList from "../components/AdminMenuList";
import Header from "../components/Header";
import ErrorModal from "../components/ErrorModal";
import { addMenuItem, editMenuItem } from "../api/menuApi";
import { MenuContext, useMenu } from "../context/MenuContext";
import { useContext } from "react";

const emptyForm = {
  imageFile: null, // File object, or null if unchanged/not yet picked
  existingImageUrl: "", // used only for the preview on edit
  name: "",
  category: "",
  tag: "",
  description: "",
  isSpecial: false,
  price: "",
};

// Small helper: pick a reasonable preview URL out of whatever shape
// item.image is in (object {high, medium, low} from the new backend,
// or a plain string from any legacy items still in the data).
function getPreviewUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.medium || image.high || image.low || "";
}

export default function Admin() {
  const [insertVisible, setInsertVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const fileInputRef = useRef(null);
  const { refreshMenu } = useMenu();
  const { menu } = useContext(MenuContext);

  // Revoke any object URL we created for a local file preview once it's
  // no longer needed, so we don't leak memory.
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (field) => (event) => {
    let value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    if (field === "price" && typeof value === "string") {
      value = value.replace(/,/g, ".");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, imageFile: file }));

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setInsertVisible(true);
  };

  const openEditForm = (item) => {
    if (!item) return;
    setEditingId(item.id);
    const existingUrl = getPreviewUrl(item.image);
    setForm({
      imageFile: null,
      existingImageUrl: existingUrl,
      name: item.name || "",
      category: item.category || "",
      tag: item.tag || "",
      description: item.description || "",
      isSpecial: Boolean(item.isSpecial),
      price: String(item.price ?? ""),
    });
    setPreviewUrl(existingUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setInsertVisible(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please choose a category.");
      return;
    }

    // A file is required when adding a new item. On edit, it's optional -
    // omitting it means "keep the existing image" (backend already
    // handles this: it only re-runs uploadImageVariants if req.file exists).
    if (!editingId && !form.imageFile) {
      setError("Please choose an image.");
      return;
    }

    // menuApi.js's addMenuItem/editMenuItem build the FormData internally -
    // they expect a plain object here, with `image` as a File (or
    // omitted/null on edit to keep the existing image).
    const payload = {
      category: form.category,
      name: form.name,
      price: form.price,
      tag: form.tag,
      description: form.description,
      isSpecial: Boolean(form.isSpecial),
      image: form.imageFile,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await editMenuItem(editingId, payload);
      } else {
        await addMenuItem(payload);
      }

      await refreshMenu(); // only reflect the change after the server confirms it
      setInsertVisible(false);
      setForm(emptyForm);
      setEditingId(null);
      setPreviewUrl("");
    } catch (err) {
      setSaveErrorMessage(
        err.message || "Unable to save item. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleErrorOk = async () => {
    setSaveErrorMessage("");
    await refreshMenu();
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
            <form
              className="add-item-form"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <h3 className="display-name">
                {editingId ? "Edit menu item" : "Add menu item"}
              </h3>

              <label htmlFor="image-file">Image:</label>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="admin-image-preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              ) : null}
              <input
                id="image-file"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="admin-input"
                onChange={handleImageChange}
                required={!editingId}
              />
              {editingId ? (
                <p className="admin-hint-text">
                  Leave empty to keep the current image.
                </p>
              ) : null}
              <hr />
              <div className="name-special">
                <label className="name-label" htmlFor="admin-input">
                  Name:
                  <input
                    type="text"
                    placeholder="burger..."
                    className="admin-input"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                  />
                </label>
                <label className="special-label" htmlFor="isSpecial-input">
                  Special:
                  <input
                    id="isSpecial-input"
                    type="checkbox"
                    className="isSpecial-input"
                    checked={Boolean(form.isSpecial)}
                    onChange={handleChange("isSpecial")}
                  />
                </label>
              </div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="admin-input"
                value={form.category}
                onChange={handleChange("category")}
                required
              >
                <option value="">Category</option>
                {menu.map((el) => (
                  <option key={el.id} value={`${el.name}`}>{el.name}</option>
                ))}
              </select>
              <label htmlFor="tag">Tag</label>
              <input
                id="tag"
                type="text"
                placeholder="e.g., Non-Fasting"
                className="admin-input"
                value={form.tag}
                onChange={handleChange("tag")}
              />
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
