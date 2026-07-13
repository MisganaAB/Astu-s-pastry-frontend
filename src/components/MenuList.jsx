import { useContext, useState, useMemo } from "react";
import Categories from "./Categories";
import MenuItem from "./MenuItem";
import { MenuContext } from "../context/MenuContext.jsx";
import Modal from "./Modal.jsx";

export default function MenuList() {
  const { menu, loading, filName } = useContext(MenuContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const categoryNames = useMemo(() => {
    return menu.flatMap((el) => el.name || []);
  }, [menu]);

  const fil = useMemo(() => {
    const data = menu
      .flatMap((el) => el.items || [])
      .filter((item) => item.isVisible ?? true);
    if (filName === "All") {
      return data;
    }

    const matchedCategory = menu.find((el) => el.name === filName);

    return matchedCategory
      ? (matchedCategory.items || []).filter((item) => item.isVisible ?? true)
      : [];
  }, [menu, filName]);

  return (
    <section className="food-list">
      <div className="menu-list-header">
        <Categories categories={categoryNames} />
      </div>
      {loading ? (
        <p style={{ color: "green" }}>Loading menu...</p>
      ) : (
        fil.map((el) => (
          <MenuItem
            key={el.id}
            src={el.image}
            name={el.name}
            categories={el.category}
            tag={el?.tag}
            desc={el.description}
            price={el.price}
            isSpecial={el.isSpecial ? true : false}
            isVisible={el.isVisible ?? true}
            onClick={() => setSelectedItem(el)}
          />
        ))
      )}
      {selectedItem && (
        <>
          <div className="glass" onClick={() => setSelectedItem(null)}></div>
          <Modal
            key={selectedItem.id}
            src={selectedItem.image}
            name={selectedItem.name}
            price={selectedItem.price}
            categories={selectedItem.category}
            tag={selectedItem?.tag}
            desc={selectedItem.description}
            isSpecial={selectedItem?.isSpecial}
            onClose={() => setSelectedItem(null)}
          />
        </>
      )}
    </section>
  );
}
