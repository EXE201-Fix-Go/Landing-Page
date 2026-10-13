import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NAV } from '../content';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const k = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${k})`;
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (!raf) raf = requestAnimationFrame(paint);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header__bar">
        <a href="#top" className="header__logo" aria-label="Fix&Go, về đầu trang">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" width={118} height={44} />
        </a>

        <nav className="header__nav" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>

        <a href="#tai-app" className="btn btn--cta header__cta">
          Tải ứng dụng
        </a>

        <button
          type="button"
          className="header__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div ref={bar} className="progress" aria-hidden="true" />

      <nav id="mobile-menu" className="mobile-menu" data-open={open} aria-label="Điều hướng trên điện thoại" hidden={!open}>
        <div className="container">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a href="#tai-app" className="btn btn--cta" onClick={() => setOpen(false)}>
            Tải ứng dụng
          </a>
        </div>
      </nav>
    </header>
  );
}
