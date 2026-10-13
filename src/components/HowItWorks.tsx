import { useRef, useState, type KeyboardEvent } from 'react';
import { STEPS } from '../content';
import { Reveal } from '../hooks/useReveal';
import { CUSTOMER_SCREENS, Phone } from './Phone';

/**
 * Năm bước đặt thợ, kèm màn hình app tương ứng. Là tablist chuẩn: chạm hoặc dùng phím mũi tên / Home / End để đổi
 * bước. Không tự chuyển bước (người đọc đang đọc dở sẽ bị giật), màn hình đổi bằng cross-fade 160 ms.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = (i: number) => {
    const next = (i + STEPS.length) % STEPS.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') (e.preventDefault(), go(i + 1));
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') (e.preventDefault(), go(i - 1));
    else if (e.key === 'Home') (e.preventDefault(), go(0));
    else if (e.key === 'End') (e.preventDefault(), go(STEPS.length - 1));
  };

  return (
    <section className="section" id="cach-hoat-dong" aria-labelledby="how-title">
      <div className="container how">
        <div className="how__steps">
          <Reveal as="p" className="eyebrow">
            Cách hoạt động
          </Reveal>
          <Reveal as="h2" index={1} id="how-title" className="h2">
            Năm bước từ lúc xe chết máy đến lúc xe chạy lại
          </Reveal>

          <div role="tablist" aria-orientation="vertical" aria-label="Các bước đặt thợ" className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} index={i + 2} className="steps__item">
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`step-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="step-panel"
                  tabIndex={active === i ? 0 : -1}
                  className={`step ${active === i ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <span className="step__no">{i + 1}</span>
                  <span className="step__text">
                    <span className="step__title">{s.title}</span>
                    <span className="step__body">{s.body}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="how__phone" id="step-panel" role="tabpanel" aria-labelledby={`step-tab-${active}`}>
          <div className="hero__blob hero__blob--soft" aria-hidden="true" />
          <Phone label={`Màn hình app ở bước ${active + 1}: ${STEPS[active].title} (dữ liệu minh họa)`}>
            {CUSTOMER_SCREENS.map((Screen, i) => (
              <div key={i} className={`swap ${i === active ? 'is-on' : ''}`}>
                <Screen />
              </div>
            ))}
          </Phone>
          <p className="caption">Màn hình minh họa với dữ liệu mẫu.</p>
        </div>
      </div>
    </section>
  );
}
