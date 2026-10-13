import { Check, MapPin, Navigation, Pause, Play, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Phase, SceneState } from '../scene/rescueScene';

const STEPS = [
  { label: 'Đã nhận', icon: Check },
  { label: 'Đang đến', icon: Navigation },
  { label: 'Đã tới', icon: MapPin },
  { label: 'Sửa chữa', icon: Wrench },
] as const;

/** Trạng thái từng bước của thẻ, suy ra từ pha của cảnh 3D (cùng một nguồn sự thật). */
function stepState(i: number, phase: Phase): 'todo' | 'now' | 'done' {
  if (i === 0) return phase >= 1 ? 'done' : 'todo';
  const nowPhase = i + 1; // Đang đến = pha 2, Đã tới = pha 3, Sửa chữa = pha 4
  if (phase > nowPhase) return 'done';
  return phase === nowPhase ? 'now' : 'todo';
}

function headline(s: SceneState) {
  switch (s.phase) {
    case 0:
      return { eyebrow: 'ĐANG TÌM THỢ', title: 'Đang tìm thợ gần bạn…' };
    case 1:
      return { eyebrow: 'ĐÃ GHÉP ĐƯỢC THỢ', title: 'Thợ đã nhận đơn' };
    case 2:
      return { eyebrow: 'THỢ ĐANG DI CHUYỂN TỚI BẠN', title: `Thợ đang tới · còn ${s.etaMin} phút` };
    case 3:
      return { eyebrow: 'THỢ ĐÃ ĐẾN NƠI', title: 'Thợ đã tới' };
    default:
      return { eyebrow: 'ĐANG SỬA XE', title: 'Xe đang được sửa' };
  }
}

const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Cảnh 3D "một chuyến cứu hộ" ở hero. Mã three.js được tải sau (import động) nên không chặn lần vẽ đầu; trong lúc
 * chờ, hoặc khi trình duyệt không có WebGL, vẫn còn thẻ trạng thái và nền, trang không bị trống.
 */
export function RescueStage() {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ setPaused(v: boolean): void } | null>(null);
  const [state, setState] = useState<SceneState>({ phase: 0, etaMin: 6 });
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(REDUCED).matches);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let dispose: (() => void) | undefined;
    let io: IntersectionObserver | undefined;

    import('../scene/rescueScene')
      .then(({ createRescueScene }) => {
        if (disposed) return;
        try {
          const scene = createRescueScene({ host: el, reducedMotion: reduced, onState: setState });
          sceneRef.current = scene;
          dispose = scene.dispose;
          io = new IntersectionObserver(([entry]) => scene.setActive(entry.isIntersecting), { threshold: 0.05 });
          io.observe(el);
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      io?.disconnect();
      dispose?.();
      sceneRef.current = null;
      setReady(false);
    };
  }, [reduced]);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    sceneRef.current?.setPaused(next);
  };

  const h = headline(state);

  return (
    <div className="stage">
      <div className="stage__glow" aria-hidden="true" />
      <div
        ref={host}
        className={`stage__canvas ${ready ? 'is-ready' : ''}`}
        role="img"
        aria-label="Minh họa 3D: xe máy của khách chết máy bên đường, thợ Fix&Go chạy tới theo đường chỉ dẫn và sửa xe."
      />

      <div className="ticket" aria-hidden="true">
        <div className="ticket__eyebrow">{h.eyebrow}</div>
        <div className="ticket__title" key={h.title}>
          {h.title}
        </div>
        <div className="ticket__steps">
          {STEPS.map((s, i) => {
            const st = stepState(i, state.phase);
            return (
              <div key={s.label} className={`tstep is-${st}`}>
                <span className="tstep__dot">
                  <s.icon size={15} />
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!failed && !reduced ? (
        <button
          type="button"
          className="stage__pause"
          aria-pressed={paused}
          aria-label={paused ? 'Phát lại hoạt cảnh' : 'Tạm dừng hoạt cảnh'}
          onClick={toggle}
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      ) : null}
    </div>
  );
}
