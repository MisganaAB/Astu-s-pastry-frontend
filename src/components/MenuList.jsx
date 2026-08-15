import { useContext, useState, useMemo } from "react";
import Categories from "./Categories";
import MenuItem from "./MenuItem";
import MenuItemSkeleton from "./MenuItemSkeleton";
import { MenuContext } from "../context/MenuContext.jsx";
import Modal from "./Modal.jsx";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

const SKELETON_COUNT = 6;
// How long the menu fetch has to be "in flight" before we bother showing a
// skeleton at all. On a fast connection the fetch resolves well within
// this window, so the skeleton never renders - no flash.
const SKELETON_DELAY_MS = 300;

export default function MenuList() {
  const { menu, loading, filName } = useContext(MenuContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const showSkeleton = useDelayedLoading(loading, SKELETON_DELAY_MS);

  // 1. Add state to track if the NumberList should show

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

  // While still loading but under the delay threshold, render nothing here
  // (not the real list, not the skeleton) rather than showing an empty
  // `fil` - `fil` is derived from `menu`, which is genuinely empty until
  // the fetch resolves, so mapping over it now would just render nothing
  // useful anyway.
  return (
    <section className="food-list">
      <div className="menu-list-header">
        <Categories categories={categoryNames} />
      </div>
      {loading
        ? showSkeleton &&
          Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <MenuItemSkeleton key={`menu-skeleton-${index}`} />
          ))
        : fil.map((el) => (
            <MenuItem
              key={el.id}
              src={el.image}
              name={el.name}
              categories={el.category}
              tag={el?.tag}
              desc={el.description}
              // price={el.price}
              isSpecial={el.isSpecial ? true : false}
              isVisible={el.isVisible ?? true}
              onClick={() => setSelectedItem(el)}
            />
          ))}

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
