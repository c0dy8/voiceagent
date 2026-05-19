import { useEffect, useState } from "react";

export function PageLoader({ isLoading, onLoadComplete }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setOpacity(0), 300);
      setTimeout(() => onLoadComplete?.(), 600);
    }
  }, [isLoading, onLoadComplete]);

  if (!isLoading && opacity === 0) return null;

  return (
    <div
      className="page-loader"
      style={{ opacity, transition: "opacity 0.3s ease-out" }}
    >
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        <p className="loader-text">Preparing ChefBot...</p>
      </div>
    </div>
  );
}
