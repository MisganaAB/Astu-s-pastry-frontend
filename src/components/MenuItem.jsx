import { useEffect, useRef, useState } from "react";
import { useMenu } from "../context/MenuContext";
import { setItemVisibility } from "../api/menuApi";
import ProgressiveImage from "./ProgressiveImage";

const MAX_SWIPE = -176;
const SWIPE_OPEN_THRESHOLD = 64;

export default function MenuItem({
  id,
  src = "images/Strawberry_Mojito_Mocktail_Recipe.webp",
  name = "Avocado Smoothie",
  desc,
  // price = 355,
  tag,
  categories,
  isSpecial = true,
  isVisible = true,
  onClick,
  isAdminView = false,
  onDeleteRequest,
  onEditRequest,
  onVisibilityError,
}) {
  const { refreshMenu } = useMenu();
  const [dragX, setDragX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const wrapperRef = useRef(null);
  const dragStateRef = useRef({ startX: 0, startOffset: 0, moved: false });

  const handleVisibilityToggle = async (event) => {
    event.stopPropagation();
    setTogglingVisibility(true);
    try {
      await setItemVisibility(id, !isVisible);
      await refreshMenu(); // UI only updates once the server confirms
    } catch (err) {
      onVisibilityError?.(err.message || "Unable to update visibility.");
    } finally {
      setTogglingVisibility(false);
    }
  };

  const closeSwipe = () => {
    setDragX(0);
    setIsSwiped(false);
  };

  const handlePointerDown = (event) => {
    if (!isAdminView) return;
    dragStateRef.current = {
      startX: event.clientX,
      startOffset: dragX,
      moved: false,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isAdminView || !isDragging) return;
    const delta = event.clientX - dragStateRef.current.startX;
    if (Math.abs(delta) > 4) dragStateRef.current.moved = true;
    const next = Math.min(
      0,
      Math.max(MAX_SWIPE, dragStateRef.current.startOffset + delta),
    );
    setDragX(next);
  };

  const handlePointerUp = () => {
    if (!isAdminView) return;
    setIsDragging(false);
    if (dragX <= -SWIPE_OPEN_THRESHOLD) {
      setDragX(MAX_SWIPE);
      setIsSwiped(true);
    } else {
      closeSwipe();
    }
  };

  const handleItemClick = () => {
    if (!isAdminView) {
      onClick?.();
      return;
    }
    if (dragStateRef.current.moved) return;
    if (isSwiped) {
      closeSwipe();
      return;
    }
    onClick?.();
  };

  useEffect(() => {
    if (!isSwiped) return undefined;
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closeSwipe();
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isSwiped]);

  if (!isVisible && !isAdminView) {
    return null;
  }

  if (!isVisible && isAdminView) {
    return (
      <div className="admin-item-card">
        <p>{name}</p>
        <button
          className="toggle-button"
          onClick={handleVisibilityToggle}
          type="button"
          disabled={togglingVisibility}
        >
          {togglingVisibility ? "..." : "Show"}
        </button>
      </div>
    );
  }

  return (
    <div className="swipe-wrapper" ref={wrapperRef}>
      {isAdminView ? (
        <div
          className="swipe-actions"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="swipe-edit-btn"
            onClick={(event) => {
              event.stopPropagation();
              closeSwipe();
              onEditRequest?.(id);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="swipe-delete-btn"
            onClick={(event) => {
              event.stopPropagation();
              closeSwipe();
              onDeleteRequest?.(id, name);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      <div
        key={id}
        id={id}
        className="food-item"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? "none" : "transform 0.25s ease",
          touchAction: isAdminView ? "pan-y" : "auto",
        }}
        onClick={handleItemClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="img-container">
          <ProgressiveImage image={src} alt={name} className="food-img" />
          {/* Anchored to the thumbnail itself (img-container has
              position: relative) rather than the whole .food-item card -
              a fixed `right: 420px` offset only worked on very wide
              layouts and got clipped by .swipe-wrapper's overflow:hidden
              on narrower cards. */}
          {isSpecial ? (
            <span className="special">
              <span></span>
              <p>Special</p>
            </span>
          ) : null}
        </div>
        <div className="food-details">
          <div className="namePrice">
            <h3 className="food-name">{name}</h3>
            {/* <p className="food-price">
              {price} <span>br</span>
            </p> */}
          </div>
          <div className="categories">
            <p>
              {tag && tag != categories && <em>{tag}</em>}
            </p>
          </div>
          <p className="food-description">{desc}</p>
        </div>
        {isAdminView ? (
          <button
            className="toggle-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleVisibilityToggle}
            type="button"
            disabled={togglingVisibility}
          >
            {togglingVisibility ? "..." : "Hide"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
