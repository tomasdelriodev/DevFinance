import { useEffect, useRef, useState } from "react";

export default function useInView(options = { rootMargin: "0px", threshold: 0.1 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      options
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return [ref, inView];
}

