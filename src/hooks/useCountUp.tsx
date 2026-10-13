import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Số chạy từ 0 tới giá trị cuối khi cuộn tới, một lần, 1,1 giây. Mặc định hiện giá trị cuối (không có JavaScript hay
 * khi bật "giảm chuyển động" thì người dùng thấy ngay con số thật).
 */
export function CountUp({ pre = '', n, dec = 0, post = '' }: { pre?: string; n: number; dec?: number; post?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(n);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / 1100);
          setV(n * easeOutCubic(k));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [n]);

  const text = v.toLocaleString('vi-VN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (
    <span ref={ref}>
      {pre}
      {text}
      {post}
    </span>
  );
}
