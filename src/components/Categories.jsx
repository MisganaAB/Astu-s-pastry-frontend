import { useState, useContext } from "react";
import { MenuContext } from "../context/MenuContext.jsx";
import { useEffect } from "react";
export default function Categories({ categories }) {
  const [category, setCategory] = useState("Desserts");
  const { setFilName } = useContext(MenuContext);
  useEffect(() => {
    setFilName(category);
  }, [category, setFilName]);
  // const buffe = ["All", ...categories];
  return (
    <div className="buffe">
      {categories.map((cat, i) => (
        <button
          key={i}
          onClick={() => setCategory(cat)}
          className={`sections ${category === cat ? "active" : ""} `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
