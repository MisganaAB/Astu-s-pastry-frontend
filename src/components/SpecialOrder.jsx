import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { MenuContext } from "../context/MenuContext.jsx";
import strawberry from "/images/Strawberry_Mojito_Mocktail_Recipe.webp";

const ROTATE_INTERVAL_MS = 5000;
const RESUME_AFTER_TOUCH_MS = 4000; // how long to stay paused after a touch ends

export default function SpecialOrder() {
  const { menu } = useContext(MenuContext);
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef(null);

  const specials = useMemo(() => {
    return menu
      .flatMap((category) => category.items || [])
      .filter((item) => item.isSpecial && (item.isVisible ?? true));
  }, [menu]);

  useEffect(() => {
    setIndex(0);
  }, [specials.length]);

  useEffect(() => {
    if (specials.length <= 1 || isPaused) return undefined;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % specials.length);
        setIsFading(false);
      }, 250);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [specials.length, isPaused]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handlePointerEnter = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    setIsPaused(false);
  };

  const handleTouchEnd = () => {
    // On touch devices there's no "hover leave" — resume after a short delay instead
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      resumeTimeoutRef.current = null;
    }, RESUME_AFTER_TOUCH_MS);
  };

  if (specials.length === 0) {
    return null;
  }

  const current = specials[index];

  return (
    <section
      className="special-rec"
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handlePointerEnter}
      onTouchEnd={handleTouchEnd}
    >
      <h3>Special Order</h3>
      <div className="special-img-container">
        <div className={`overlay`}>
          <div className={`text ${isFading ? "fading" : ""}`}>
            <h3>{current.name}</h3>
            <p>{current.category}</p>
          </div>
        </div>
        <img
          className={`special-img ${isFading ? "fading" : ""}`}
          src={current.image || strawberry}
          alt={current.name}
        />
      </div>
      {specials.length > 1 ? (
        <div className="special-dots">
          {specials.map((item, i) => (
            <span
              key={item.id}
              className={`special-dot ${i === index ? "active" : ""}`}
              onClick={() => {
                setIndex(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
