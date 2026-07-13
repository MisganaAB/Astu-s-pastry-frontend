import settingsData from "../data/adminSettings.json";

const STORAGE_KEY = "qrmenu-admin-settings";

function normalizeSettings(rawSettings) {
  const normalizedMenuItems = Object.entries(
    rawSettings.menuItems || {},
  ).reduce((acc, [itemId, value]) => {
    acc[itemId] = typeof value === "boolean" ? { isVisible: value } : value;
    return acc;
  }, {});

  return {
    ...rawSettings,
    menuItems: normalizedMenuItems,
  };
}

function readSettings() {
  if (typeof window === "undefined") {
    return normalizeSettings(settingsData);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return normalizeSettings(settingsData);
    }

    return normalizeSettings({ ...settingsData, ...JSON.parse(saved) });
  } catch {
    return normalizeSettings(settingsData);
  }
}

export function getAdminSettings() {
  return readSettings();
}

export function saveAdminSettings(nextSettings) {
  const current = readSettings();
  const merged = { ...current, ...nextSettings };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return merged;
}

export function setMenuItemVisibility(itemId, visible) {
  const current = readSettings();
  const nextMenuItems = { ...(current.menuItems || {}) };
  nextMenuItems[itemId] = { isVisible: visible };
  return saveAdminSettings({ menuItems: nextMenuItems });
}

export function isMenuItemVisible(itemId) {
  const settings = readSettings();
  return settings.menuItems?.[itemId]?.isVisible ?? true;
}

export function setTheme(theme, scope = "admin") {
  return saveAdminSettings({ [`theme:${scope}`]: theme });
}

export function getTheme(scope = "admin") {
  return (
    readSettings()[`theme:${scope}`] || (scope === "admin" ? "dark" : "dark")
  );
}
