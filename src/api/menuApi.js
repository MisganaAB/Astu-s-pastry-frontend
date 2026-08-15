import { MENU_API_URL, MENU_ITEMS_API_URL } from "../config/api";
import { getToken } from "../auth/tokenStore";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Builds a multipart/form-data payload for create/edit. `image` is expected
// to be a File object (from an <input type="file"> or drag-drop) when the
// user is uploading a new picture, or omitted/undefined when editing
// without changing the image. Do NOT set Content-Type manually when sending
// FormData - the browser sets the multipart boundary for you.
function buildMenuItemFormData({
  category,
  name,
  price,
  description,
  isSpecial,
  image,
  tag,
}) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("name", name);
  formData.append("price", price);
  formData.append("description", description ?? "");
  formData.append("tag", tag ?? "");
  formData.append("isSpecial", String(!!isSpecial));
  if (image instanceof File) {
    formData.append("image", image);
  }
  return formData;
}

export async function menuApi() {
  if (!MENU_API_URL) {
    throw new Error("API URL not configured for menu data");
  }

  const response = await fetch(MENU_API_URL);
  if (!response.ok) {
    throw new Error("failed to fetch menu");
  }

  return await response.json();
}

// `image` must be a File (e.g. from an <input type="file"> onChange event
// or a drop handler) - it is required for create.
export async function addMenuItem({
  category,
  name,
  price,
  description,
  isSpecial,
  image,
  tag,
}) {
  if (!(image instanceof File)) {
    throw new Error("An image file is required to add a menu item.");
  }

  const response = await fetch(MENU_ITEMS_API_URL, {
    method: "POST",
    headers: { ...authHeaders() }, // no Content-Type - browser sets multipart boundary
    credentials: "include",
    body: buildMenuItemFormData({
      category,
      name,
      price,
      description,
      isSpecial,
      image,
      tag,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to add item.");
  }
  return data.item;
}

// `image` is optional here - pass a File only if the user picked a new
// picture; omit it (or pass undefined/null) to keep the item's existing
// image untouched.
export async function editMenuItem(
  id,
  { category, name, price, description, image, isSpecial, tag },
) {
  const response = await fetch(
    `${MENU_ITEMS_API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { ...authHeaders() }, // no Content-Type - browser sets multipart boundary
      credentials: "include",
      body: buildMenuItemFormData({
        category,
        name,
        price,
        description,
        isSpecial,
        image,
        tag,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to update item.");
  }
  return data.item;
}

export async function deleteMenuItem(id) {
  const response = await fetch(
    `${MENU_ITEMS_API_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { ...authHeaders() },
      credentials: "include",
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete item.");
  }
  return data;
}

export async function setItemVisibility(id, isVisible) {
  const response = await fetch(
    `${MENU_ITEMS_API_URL}/${encodeURIComponent(id)}/visibility`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ isVisible }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to update visibility.");
  }
  return data.item;
}
