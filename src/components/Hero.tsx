import { ArrowDown, ArrowUpRight, BadgeCheck, MapPin, ReceiptText } from 'lucide-react';

import { BRAND, LINKS } from '../config';
import { Reveal } from '../hooks/useReveal';
import { RescueStage } from './RescueStage';

/** Tiêu đề hiện từng từ: mỗi từ trượt lên từ sau một "cửa sổ" cắt, lệch nhau 70 ms. Chỉ transform nên không nhảy bố cục. */
function Words({ text, start }: { text: string; start: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ animationDelay: `${(start + i) * 70 + 80}ms` }}>{w}</span>
          </span>{' '}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__copy">
          <Reveal as="p" className="eyebrow">
            <MapPin size={14} aria-hidden="true" /> Đang chạy thử tại {BRAND.pilotArea}
          </Reveal>
          <h1 className="hero__title" aria-label="Xe hỏng giữa đường? Thợ đến tận nơi.">
            <span className="hero__line">
              <Words text="Xe hỏng giữa đường?" start={0} />
            </span>
            <span className="hero__line hero__accent">
              <Words text="Thợ đến tận nơi." start={4} />
            </span>
          </h1>
          <Reveal as="p" index={5} className="lead">
            Fix&Go kết nối bạn với thợ sửa xe máy đã xác minh ở gần nhất. Biết giá trước khi sửa, bạn đồng ý rồi thợ
            mới làm.
          </Reveal>
          <Reveal index={6} className="hero__actions">
            <a href="#tai-app" className="btn btn--cta btn--lg">
              Gọi thợ ngay
            </a>
            {LINKS.webApp ? (
              <a href={LINKS.webApp} className="btn btn--ghost btn--lg" target="_blank" rel="noopener">
                Trải nghiệm thử <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ) : null}
            <a href="#cach-hoat-dong" className="hero__link">
              Xem cách hoạt động <ArrowDown size={18} aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal as="ul" index={7} className="hero__facts">
            <li>
              <BadgeCheck size={18} aria-hidden="true" /> Thợ đã xác minh
            </li>
            <li>
              <ReceiptText size={18} aria-hidden="true" /> Báo giá trước khi sửa
            </li>
            <li>
              <MapPin size={18} aria-hidden="true" /> Ghép thợ gần bạn
            </li>
          </Reveal>
        </div>

        <Reveal index={2} className="hero__visual">
          <RescueStage />
        </Reveal>
      </div>
    </section>
  );
}
