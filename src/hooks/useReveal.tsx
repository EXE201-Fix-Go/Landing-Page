import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Hiện dần một khối khi cuộn tới: mờ + trượt lên 12 px, đúng một lần. Chỉ đổi opacity và transform nên không làm
 * nhảy bố cục. `index` tạo độ trễ lần lượt 60 ms giữa các khối anh em. Khi hệ điều hành bật "giảm chuyển động"
 * thì CSS bỏ phần trượt, chỉ còn mờ nhẹ (xem .reveal trong index.css).
 */
export function Reveal({
  as: Tag = 'div',
  index = 0,
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  index?: number;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-in', '');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--i': index } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
