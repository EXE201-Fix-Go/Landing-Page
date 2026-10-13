import { ArrowDown, BadgeCheck, MapPin, ReceiptText } from 'lucide-react';
import { BRAND } from '../config';
import { Phone, ScreenTracking } from './Phone';
import { Reveal } from '../hooks/useReveal';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__copy">
          <Reveal as="p" className="eyebrow">
            <MapPin size={14} aria-hidden="true" /> Đang chạy thử tại {BRAND.pilotArea}
          </Reveal>
          <Reveal as="h1" index={1} className="hero__title">
            Xe hỏng giữa đường?
            <br />
            <span className="hero__accent">Thợ đến tận nơi.</span>
          </Reveal>
          <Reveal as="p" index={2} className="lead">
            Fix&Go kết nối bạn với thợ sửa xe máy đã xác minh ở gần nhất. Biết giá trước khi sửa, bạn đồng ý rồi thợ
            mới làm.
          </Reveal>
          <Reveal index={3} className="hero__actions">
            <a href="#tai-app" className="btn btn--cta btn--lg">
              Gọi thợ ngay
            </a>
            <a href="#cach-hoat-dong" className="btn btn--ghost btn--lg">
              Xem cách hoạt động <ArrowDown size={18} aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal as="ul" index={4} className="hero__facts">
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
          <div className="hero__blob" aria-hidden="true" />
          <Phone label="Màn hình theo dõi thợ đang tới trong app Fix&Go (dữ liệu minh họa)">
            <ScreenTracking />
          </Phone>
          <div className="chip chip--a" aria-hidden="true">
            <BadgeCheck size={16} /> Thợ đã xác minh
          </div>
          <div className="chip chip--b" aria-hidden="true">
            <ReceiptText size={16} /> Giá duyệt trước
          </div>
        </Reveal>
      </div>
    </section>
  );
}
