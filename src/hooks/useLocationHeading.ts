import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { Numbers } from "@openforis/arena-core";

import { circularEma, EMA_ALPHA } from "./headingUtils";

export const useLocationHeading = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const filteredHeadingRef = useRef<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [locationHeadingAvailable, setLocationHeadingAvailable] =
    useState(true);
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  // Reset availability optimistically during render when re-enabled, avoiding
  // a synchronous setState inside an effect body (which causes cascading renders).
  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    if (enabled && !locationHeadingAvailable) {
      setLocationHeadingAvailable(true);
    }
  }

  useEffect(() => {
    if (!enabled) {
      filteredHeadingRef.current = null;
      return;
    }

    // cancelled flag guards the race where the component unmounts before the
    // async watchHeadingAsync promise resolves
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    Location.watchHeadingAsync((headingData) => {
      const raw =
        headingData.trueHeading >= 0
          ? headingData.trueHeading
          : headingData.magHeading;
      if (!Number.isFinite(raw) || raw < 0) return;
      const prev = filteredHeadingRef.current;
      const filtered = prev === null ? raw : circularEma(prev, raw, EMA_ALPHA);
      filteredHeadingRef.current = filtered;
      setHeading(Numbers.roundToPrecision(filtered, 1));
    })
      .then((sub) => {
        if (cancelled) {
          sub.remove();
        } else {
          subscription = sub;
        }
      })
      .catch(() => {
        setLocationHeadingAvailable(false);
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return { heading, locationHeadingAvailable };
};
