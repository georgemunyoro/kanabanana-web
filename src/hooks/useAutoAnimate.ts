import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef } from "react";

export const useAutoAnimate = () => {
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return { parent };
};
