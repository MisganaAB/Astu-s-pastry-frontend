import { useContext, useState, useMemo } from "react";
import Categories from "./Categories";
import MenuItem from "./MenuItem";
import { MenuContext } from "../context/MenuContext.jsx";
import Modal from "./Modal.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";
import ErrorModal from "./ErrorModal.jsx";
import { deleteMenuItem } from "../api/menuApi";

export default function AdminMenuList({ onEditRequest }) {
  const {
    menu,
    loading,
    filName,
    applyItemRemoval,
    rollbackMenu,
    refreshMenu,
  } = useContext(MenuContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const categoryNames = useMemo(
    () => menu.flatMap((el) => el.name || []),
    [menu],
  );

  const fil = useMemo(() => {
    const data = menu.flatMap((el) => el.items || []);
    if (filName === "All") return data;
    const matchedCategory = menu.find((el) => el.name === filName);
    return matchedCategory ? matchedCategory.items : [];
  }, [menu, filName]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    const snapshot = applyItemRemoval(pendingDelete.id); // instant UI removal
    setPendingDelete(null);
    setIsDeleting(true);

    try {
      await deleteMenuItem(pendingDelete.id);
      // success: optimistic state already matches reality, nothing more to do
    } catch (err) {
      rollbackMenu(snapshot);
      setDeleteErrorMessage(
        err.message || "Unable to delete item. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleErrorOk = async () => {
    setDeleteErrorMessage("");
    await refreshMenu();
  };

  return (
    <section className="food-list">
      <div className="menu-list-header">
        <Categories categories={categoryNames} />
      </div>
      {loading ? (
        <p style={{ color: "whitesmoke" }}>Loading menu...</p>
      ) : (
        fil.map((el) => (
          <MenuItem
            key={el.id}
            id={el.id}
            src={el.image}
            name={el.name}
            categories={el.category}
            tag={el?.tag}
            desc={el.description}
            price={el.price}
            isSpecial={el.isSpecial ? true : false}
            onClick={() => setSelectedItem(el)}
            isAdminView={true}
            onDeleteRequest={(id, name) => setPendingDelete({ id, name })}
            onEditRequest={(id) =>
              onEditRequest?.(fil.find((item) => item.id === id))
            }
            isVisible={el.isVisible ?? true}
            onVisibilityError={(message) => setDeleteErrorMessage(message)}
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
      {pendingDelete && (
        <ConfirmDeleteModal
          itemName={pendingDelete.name}
          isDeleting={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {deleteErrorMessage && (
        <ErrorModal message={deleteErrorMessage} onOk={handleErrorOk} />
      )}
    </section>
  );
}
