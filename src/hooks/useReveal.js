import { useEffect } from "react";

/**
 * Adds the `active` class to a referenced element when it enters the viewport
 * so the `.reveal` animation defined in the global styles can run. The class
 * is removed when the element leaves the viewport to allow the animation to be
 * replayed if the user scrolls away and back.
 */
export default function useReveal(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      element.classList.add("active");
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else {
            entry.target.classList.remove("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);
}
