import { MenuContext } from "./MenuContext";
import { useState, useEffect } from "react";
import { menuApi } from "../api/menuApi";

export default function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  // Start true: without this, the very first render shows neither a
  // skeleton nor "loading" text (loading is false and menu is empty), so
  // there's a blank frame until the useEffect below fires and flips this.
  // Starting true means MenuList shows skeletons from the first paint.
  const [loading, setLoading] = useState(true);
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

  return (
    <MenuContext.Provider
      value={{
        menu,
        loading,
        filName,
        setFilName,
        refreshMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
