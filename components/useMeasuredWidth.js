"use client";

import React from "react";

export default function useMeasuredWidth(fallback = 0) {
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState(fallback);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect?.width ?? 0;
      if (next > 0) setWidth(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}
