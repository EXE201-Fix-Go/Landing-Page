import {
  BadgeCheck,
  BatteryCharging,
  Check,
  CircleDot,
  Lightbulb,
  Link2,
  MapPin,
  Navigation,
  Phone as PhoneIcon,
  Star,
  Truck,
  Wind,
  Wrench,
  Zap,
  Droplets,
  OctagonX,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CALL_OUT_FEE, formatVnd, type ServiceIcon } from '../content';

/**
 * Khung điện thoại và các màn hình minh họa của app. Dựng bằng HTML/CSS (không dùng ảnh chụp thật) để chữ luôn
 * sắc nét và không lộ số điện thoại hay tên tài khoản thử nghiệm. Dữ liệu trong màn hình là dữ liệu mẫu.
 */
export function Phone({ label, tone = 'customer', children }: { label: string; tone?: 'customer' | 'partner'; children: ReactNode }) {
  return (
    <figure className={`phone phone--${tone}`} aria-label={label}>
      <div className="phone__screen" aria-hidden="true">
        <div className="phone__status">
          <span>9:41</span>
          <span className="phone__island" />
          <span className="phone__bars">
            <i />
            <i />
            <i />
          </span>
        </div>
        {children}
      </div>
    </figure>
  );
}

export const SERVICE_ICONS: Record<ServiceIcon, LucideIcon> = {
  tire: CircleDot,
  pump: Wind,
  tube: Wrench,
  battery: BatteryCharging,
  chain: Link2,
  oil: Droplets,
  tow: Truck,
  brake: OctagonX,
  light: Lightbulb,
  plug: Zap,
};

/* ---------- Màn hình khách ---------- */

export function ScreenPickService() {
  const rows: { icon: ServiceIcon; name: string; price: string; on?: boolean }[] = [
    { icon: 'tire', name: 'Vá xe lưu động', price: 'từ 80k', on: true },
    { icon: 'pump', name: 'Bơm lốp tận nơi', price: 'từ 50k' },
    { icon: 'battery', name: 'Kích bình ắc quy', price: 'từ 80k' },
    { icon: 'chain', name: 'Tăng sên', price: 'từ 60k' },
    { icon: 'tow', name: 'Chở / kéo xe', price: 'từ 60k' },
  ];
  return (
    <div className="scr">
      <div className="scr__title">Xe bạn gặp sự cố gì?</div>
      <div className="scr__list">
        {rows.map((r) => {
          const Icon = SERVICE_ICONS[r.icon];
          return (
            <div key={r.name} className={`scr__row ${r.on ? 'is-on' : ''}`}>
              <span className="scr__ico">
                <Icon size={16} />
              </span>
              <span className="scr__name">{r.name}</span>
              <span className="scr__price">{r.price}</span>
            </div>
          );
        })}
      </div>
      <div className="scr__pin">
        <MapPin size={14} /> Cổng KTX khu B, Làng Đại học
      </div>
      <div className="scr__cta">Xác nhận · phí gọi thợ {formatVnd(CALL_OUT_FEE)}</div>
    </div>
  );
}

export function ScreenSearching() {
  return (
    <div className="scr scr--map">
      <div className="map-bg" />
      <div className="radar">
        <span className="radar__ring" />
        <span className="radar__ring" style={{ animationDelay: '0.9s' }} />
        <span className="radar__ring" style={{ animationDelay: '1.8s' }} />
        <span className="radar__pin">
          <MapPin size={20} />
        </span>
      </div>
      <div className="sheet">
        <div className="sheet__eyebrow">ĐANG TÌM THỢ</div>
        <div className="sheet__title">Đang tìm thợ gần bạn…</div>
        <div className="scr__muted">Yêu cầu đã gửi tới các thợ đang sẵn sàng quanh khu vực.</div>
        <div className="scr__ghost">Hủy yêu cầu</div>
      </div>
    </div>
  );
}

export function ScreenTracking() {
  const steps = [
    { label: 'Đã nhận', state: 'done', icon: Check },
    { label: 'Đang đến', state: 'now', icon: Navigation },
    { label: 'Đã tới', state: 'todo', icon: MapPin },
    { label: 'Sửa chữa', state: 'todo', icon: Wrench },
  ] as const;
  return (
    <div className="scr scr--map">
      <div className="map-bg" />
      <div className="map-route" />
      <div className="sheet">
        <div className="sheet__eyebrow">THỢ ĐANG DI CHUYỂN TỚI BẠN</div>
        <div className="sheet__title">Thợ đang tới</div>
        <div className="stepper">
          {steps.map((s) => (
            <div key={s.label} className={`stepper__i is-${s.state}`}>
              <span className="stepper__dot">
                <s.icon size={14} />
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mech">
          <span className="mech__avatar">M</span>
          <span>
            <b>Anh Minh</b>
            <small>
              4,9 <Star size={11} fill="currentColor" /> · 126 đơn
            </small>
          </span>
          <BadgeCheck size={18} className="mech__ok" />
        </div>
        <div className="scr__cta">
          <PhoneIcon size={15} /> Gọi cho thợ
        </div>
      </div>
    </div>
  );
}

export function ScreenQuote() {
  return (
    <div className="scr">
      <div className="scr__title">Báo giá từ thợ</div>
      <div className="scr__muted">Thợ đã kiểm tra xe: thủng lốp sau, vá tại chỗ được.</div>
      <div className="quote">
        <div>
          <span>Phí gọi thợ</span>
          <b>{formatVnd(CALL_OUT_FEE)}</b>
        </div>
        <div>
          <span>Công vá lốp</span>
          <b>{formatVnd(80_000)}</b>
        </div>
        <div>
          <span>Linh kiện</span>
          <b>0đ</b>
        </div>
        <div className="quote__total">
          <span>Tổng cộng</span>
          <b>{formatVnd(CALL_OUT_FEE + 80_000)}</b>
        </div>
      </div>
      <div className="scr__note">Thợ chỉ bắt đầu sửa sau khi bạn đồng ý.</div>
      <div className="scr__btns">
        <span className="scr__ghost">Từ chối</span>
        <span className="scr__cta">Đồng ý báo giá</span>
      </div>
    </div>
  );
}

export function ScreenDone() {
  return (
    <div className="scr scr--center">
      <span className="done__tick">
        <Check size={30} strokeWidth={3} />
      </span>
      <div className="scr__title">Hoàn tất</div>
      <div className="scr__muted">Thanh toán tiền mặt {formatVnd(CALL_OUT_FEE + 80_000)}</div>
      <div className="done__stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={26} fill="currentColor" />
        ))}
      </div>
      <div className="scr__muted">Đánh giá anh Minh</div>
      <div className="scr__cta">Gửi đánh giá</div>
    </div>
  );
}

export const CUSTOMER_SCREENS = [ScreenPickService, ScreenSearching, ScreenTracking, ScreenQuote, ScreenDone] as const;

/* ---------- Màn hình thợ ---------- */

export function ScreenPartnerOffer() {
  return (
    <div className="scr scr--partner">
      <div className="pbar">
        <span className="pbar__logo">
          <Wrench size={16} />
        </span>
        <span>
          <b>Thợ Fix&Go</b>
          <small>Thợ cá nhân</small>
        </span>
        <span className="pbar__state">SẴN SÀNG</span>
      </div>
      <div className="pstats">
        <div>
          <small>HÔM NAY</small>
          <b>450.000đ</b>
          <em>4 cuốc hoàn tất</em>
        </div>
        <div>
          <small>ĐÁNH GIÁ</small>
          <b>4,9 ★</b>
          <em>126 lượt</em>
        </div>
      </div>
      <div className="offer">
        <div className="offer__timer">
          <i />
        </div>
        <div className="offer__head">
          <span className="offer__ico">
            <Wrench size={18} />
          </span>
          <span>
            <small className="offer__tag">KHẨN CẤP</small>
            <b>Vá xe lưu động</b>
          </span>
          <span className="offer__left">
            <small>HẾT HẠN</small>
            <b>45s</b>
          </span>
        </div>
        <div className="offer__earn">
          <small>Ước tính thu nhập</small>
          <b>30.000đ + công</b>
        </div>
        <div className="offer__where">
          <Navigation size={14} />
          <span>
            <b>Vòng phát 1</b>
            <small>Cổng KTX khu B, Làng Đại học</small>
          </span>
        </div>
        <div className="scr__btns">
          <span className="scr__ghost">Từ chối</span>
          <span className="scr__cta scr__cta--partner">Nhận đơn ngay</span>
        </div>
      </div>
    </div>
  );
}
