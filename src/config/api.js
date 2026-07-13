const defaultApiBase = import.meta.env.DEV ? "http://localhost:1414" : "";
export const API_URL = import.meta.env.VITE_API_URL || defaultApiBase;
export const MENU_API_URL =
  import.meta.env.VITE_MENU_API_URL || `${API_URL}/api/v1/menu`;
export const MENU_ITEMS_API_URL = `${MENU_API_URL}/items`;
