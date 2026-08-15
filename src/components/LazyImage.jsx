import { useState } from "react";

/**
 * Renders a menu item's image with a blur-up lazy-load effect.
 *
 * `image` is expected to be the new shape produced by the backend:
 *   { high: string, medium: string, low: string }
 * `image.low` is a tiny, heavily blurred placeholder shown immediately.
 * `image.medium`/`image.high` are swapped in via srcSet once the real
 * image finishes loading, and only start loading once they're near the
 * viewport (native `loading="lazy"`).
 *
 * Falls back to treating `image` as a plain URL string, in case any old
 * un-migrated items still have the legacy shape.
 */
export default function LazyImage({ image, alt = "", className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!image) return null;

  if (typeof image === "string") {
    return (
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <div className={`lazy-image ${className}`}>
      <img
        src={image.low}
        alt=""
        aria-hidden="true"
        className="lazy-image__placeholder"
        style={{ opacity: loaded ? 0 : 1 }}
      />
      <img
        src={image.medium}
        srcSet={`${image.medium} 600w, ${image.high} 1200w`}
        sizes="(max-width: 640px) 100vw, 50vw"
        loading="lazy"
        decoding="async"
        alt={alt}
        className="lazy-image__real"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          console.error("LazyImage failed to load:", e.currentTarget.src);
        }}
      />
      {errored && (
        <div className="lazy-image__error" title={image.medium}>
          Image unavailable
        </div>
      )}
    </div>
  );
}
