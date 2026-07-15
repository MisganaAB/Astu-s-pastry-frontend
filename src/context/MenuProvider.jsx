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
