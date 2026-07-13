import { MenuContext } from "./MenuContext";
import { useState, useEffect } from "react";
import { menuApi } from "../api/menuApi";

export default function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filName, setFilName] = useState("All");

  const refreshMenu = async () => {
    try {
      setLoading(true);
      const data = await menuApi();
      setMenu(data);
    } catch (err) {
      console.log("API error during load:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMenu();
  }, []);

  // Optimistically insert or replace an item in local state (used for add/edit).
  // Returns the previous menu snapshot so the caller can roll back on failure.
  const applyItemUpsert = (item) => {
    const previous = menu;
    setMenu((prev) => {
      let found = false;
      const next = prev.map((cat) => {
        if (cat.name !== item.category) {
          // item may be moving OUT of this category on edit — remove it here if present
          const filteredItems = cat.items.filter((i) => i.id !== item.id);
          return filteredItems.length !== cat.items.length
            ? { ...cat, items: filteredItems }
            : cat;
        }
        const index = cat.items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          found = true;
          const items = [...cat.items];
          items[index] = item;
          return { ...cat, items };
        }
        found = true;
        return { ...cat, items: [...cat.items, item] };
      });
      return found ? next : prev;
    });
    return previous;
  };

  // Optimistically remove an item by id (used for delete). Returns previous snapshot.
  const applyItemRemoval = (id) => {
    const previous = menu;
    setMenu((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.id !== id),
      })),
    );
    return previous;
  };
  const applyVisibilityToggle = (id, isVisible) => {
    const previous = menu;
    setMenu((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === id ? { ...item, isVisible } : item,
        ),
      })),
    );
    return previous;
  };

  const rollbackMenu = (snapshot) => {
    setMenu(snapshot);
  };

  return (
    <MenuContext.Provider
      value={{
        menu,
        loading,
        filName,
        setFilName,
        refreshMenu,
        applyItemUpsert,
        applyItemRemoval,
        rollbackMenu,
        applyVisibilityToggle,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
