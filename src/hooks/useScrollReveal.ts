import { useEffect, useRef, useState } from 'react';

const REVEAL_CLASS = 'reveal-visible';

/**
 * Observes an element and adds reveal-visible when it enters the viewport.
 * Use with .reveal-on-scroll in CSS for scroll-triggered fade-in-up.
 */
export function useScrollReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          el.classList.add(REVEAL_CLASS);
        }
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.rootMargin, options?.threshold]);

  return { ref, visible };
}
