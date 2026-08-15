export default function MenuItemSkeleton() {
  return (
    <div className="food-item skeleton-item" aria-hidden="true">
      <div className="img-container">
        <div className="skeleton-shimmer skeleton-image" />
      </div>
      <div className="food-details">
        <div className="skeleton-shimmer skeleton-line skeleton-line--title" />
        <div className="skeleton-shimmer skeleton-line skeleton-line--tag" />
        <div className="skeleton-shimmer skeleton-line skeleton-line--desc" />
        <div className="skeleton-shimmer skeleton-line skeleton-line--desc-short" />
      </div>
    </div>
  );
}
