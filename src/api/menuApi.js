import { MENU_API_URL, MENU_ITEMS_API_URL } from "../config/api";

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

export async function addMenuItem({
  category,
  name,
  price,
  description,
  image,
}) {
  const response = await fetch(MENU_ITEMS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ category, name, price, description, image }),
  });
  const rawText = await response.text();
  alert("status=" + response.status + " body=" + rawText); // TEMP DEBUG

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to add item.");
  }

  return data.item;
}

export async function editMenuItem(
  id,
  { category, name, price, description, image },
) {
  const response = await fetch(
    `${MENU_ITEMS_API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category, name, price, description, image }),
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
      headers: { "Content-Type": "application/json" },
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
