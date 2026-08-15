import { useState } from "react";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import "./ProgressiveImage.css";

// How long the low-res tier has to still be loading before we bother
// showing the shimmer skeleton. On a fast connection it resolves within
// this window and the skeleton never appears.
const IMAGE_SKELETON_DELAY_MS = 200;

/**
 * Renders an item's image with:
 *  - a shimmering skeleton, but ONLY if the low-res tier is still loading
 *    after IMAGE_SKELETON_DELAY_MS - fast connections never see it
 *  - a low -> medium -> high quality crossfade as each tier finishes
 *    loading, each tier only requested once the previous one has resolved
 *  - native `loading="lazy"` on the first layer, so the fetch itself is
 *    deferred until the element is near the viewport
 *
 * `image` is expected as { high, medium, low }. Falls back to treating
 * `image` as a plain URL string for any un-migrated legacy items.
 */
export default function ProgressiveImage({ image, alt = "", className = "" }) {
  // "skeleton" -> "low" -> "medium" -> "high"
  const [stage, setStage] = useState("skeleton");
  const showSkeleton = useDelayedLoading(
    stage === "skeleton",
    IMAGE_SKELETON_DELAY_MS,
  );

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
    <div className={`progressive-image ${className}`}>
      {showSkeleton && (
        <div className="progressive-image__skeleton skeleton-shimmer" />
      )}

      {/* Low-res layer: loading="lazy" is the actual lazy-load trigger -
          the browser only fetches this once the element nears the
          viewport, which is exactly the "request reaches it" moment. */}
      <img
        src={image.low}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`progressive-image__layer progressive-image__layer--low ${
          stage !== "skeleton" ? "is-visible" : ""
        }`}
        onLoad={() => setStage((s) => (s === "skeleton" ? "low" : s))}
      />

      {/* Medium only starts fetching once low has resolved - by then we
          know the item is on/near screen, so no need to gate it further. */}
      {stage !== "skeleton" && (
        <img
          src={image.medium}
          alt=""
          aria-hidden="true"
          decoding="async"
          className={`progressive-image__layer ${
            stage === "medium" || stage === "high" ? "is-visible" : ""
          }`}
          onLoad={() => setStage((s) => (s === "low" ? "medium" : s))}
        />
      )}

      {/* High only starts fetching once medium has resolved. */}
      {(stage === "medium" || stage === "high") && (
        <img
          src={image.high}
          alt={alt}
          decoding="async"
          className={`progressive-image__layer ${
            stage === "high" ? "is-visible" : ""
          }`}
          onLoad={() => setStage((s) => (s === "medium" ? "high" : s))}
        />
      )}
    </div>
  );
}
