import { BadgeCheck, Banknote, Camera, ChevronDown, History, MapPin, ReceiptText, ShieldCheck, Store } from 'lucide-react';
import { APK, BRAND, LINKS } from '../config';
import { CALL_OUT_FEE, FAQ, PARTNER_POINTS, SERVICES, TARGETS, TRUST, formatVnd } from '../content';
import { CountUp } from '../hooks/useCountUp';
import { Reveal } from '../hooks/useReveal';
import { Phone, ScreenPartnerOffer, SERVICE_ICONS } from './Phone';

/* ---------- Ghép thợ: vòng tìm mở rộng ---------- */

export function Dispatch() {
  return (
    <section className="section section--tint" aria-labelledby="dispatch-title">
      <div className="container dispatch">
        <div className="dispatch__map" aria-hidden="true">
          <div className="map-bg map-bg--round" />
          <span className="ring ring--3" />
          <span className="ring ring--2" />
          <span className="ring ring--1" />
          <span className="dispatch__you">
            <MapPin size={22} />
          </span>
          <span className="dot dot--a" />
          <span className="dot dot--b" />
          <span className="dot dot--c" />
          <span className="dot dot--d" />
        </div>
        <div>
          <Reveal as="p" className="eyebrow">
            Ghép thợ
          </Reveal>
          <Reveal as="h2" index={1} id="dispatch-title" className="h2">
            Không ai nhận? Fix&Go tự tìm xa hơn
          </Reveal>
          <Reveal as="p" index={2} className="lead">
            Yêu cầu của bạn được gửi cùng lúc tới các thợ đủ điều kiện quanh vị trí, thợ bấm nhận trước được giao đơn.
            Nếu sau khoảng một đến một phút rưỡi chưa ai nhận, vùng tìm thợ tự mở rộng sang vòng tiếp theo.
          </Reveal>
          <Reveal as="ul" index={3} className="ticks">
            <li>Tiêu chí ghép: khoảng cách, loại dịch vụ, trạng thái sẵn sàng, đánh giá và hiệu suất của thợ.</li>
            <li>Hết các vòng mà vẫn chưa có thợ, bạn được báo ngay và có lựa chọn tiếp theo, không phải chờ vô vọng.</li>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dịch vụ và giá ---------- */

export function Services() {
  return (
    <section className="section" id="dich-vu" aria-labelledby="services-title">
      <div className="container">
        <div className="section__head">
          <Reveal as="p" className="eyebrow">
            Dịch vụ & giá
          </Reveal>
          <Reveal as="h2" index={1} id="services-title" className="h2">
            Giá cơ bản rõ ràng, giá cuối cùng do bạn duyệt
          </Reveal>
          <Reveal as="p" index={2} className="lead">
            Giá dưới đây là mức khởi điểm. Thợ kiểm tra xe rồi gửi báo giá chính thức trong app; bạn chỉ trả đúng bản
            báo giá mình đã đồng ý.
          </Reveal>
        </div>

        <ul className="services">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <Reveal as="li" key={s.name} index={i % 5} className="service">
                <span className="service__ico">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="service__name">{s.name}</span>
                <span className="service__hint">{s.hint}</span>
                <span className="service__price">
                  <small>từ</small> {formatVnd(s.price)}
                  {s.note ? <small className="service__note"> {s.note}</small> : null}
                </span>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="formula">
          <div className="formula__title">Tổng tiền của một đơn</div>
          <div className="formula__eq" role="math" aria-label="Phí gọi thợ cộng công cộng linh kiện cộng phụ thu trừ giảm giá">
            <span>Phí gọi thợ</span>
            <i>+</i>
            <span>Công</span>
            <i>+</i>
            <span>Linh kiện</span>
            <i>+</i>
            <span>Phụ thu</span>
            <i>−</i>
            <span>Giảm giá</span>
          </div>
          <p>
            Phí gọi thợ hiện là <b>{formatVnd(CALL_OUT_FEE)}</b> và thuộc về thợ nhận đơn. Quãng đường thợ di chuyển
            (nếu có tính) cũng được hiển thị trước khi bạn xác nhận.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Tin cậy ---------- */

const TRUST_ICONS = { shield: ShieldCheck, receipt: ReceiptText, camera: Camera, history: History } as const;

export function Trust() {
  return (
    <section className="section section--tint" aria-labelledby="trust-title">
      <div className="container">
        <div className="section__head">
          <Reveal as="p" className="eyebrow">
            An tâm
          </Reveal>
          <Reveal as="h2" index={1} id="trust-title" className="h2">
            Làm đúng việc, trả đúng giá, có căn cứ rõ ràng
          </Reveal>
        </div>

        <ul className="trust">
          {TRUST.map((t, i) => {
            const Icon = TRUST_ICONS[t.icon];
            return (
              <Reveal as="li" key={t.title} index={i} className="trust__card">
                <span className="trust__ico">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="targets">
          <p className="targets__title">Mục tiêu vận hành của Fix&Go trong giai đoạn thử nghiệm</p>
          <dl className="targets__list">
            {TARGETS.map((t) => (
              <div key={t.label}>
                <dt>{t.label}</dt>
                <dd>
                  <CountUp pre={t.pre} n={t.n} dec={'dec' in t ? t.dec : 0} post={t.post} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="targets__note">Đây là chỉ tiêu chúng tôi đặt ra và đang đo, chưa phải số liệu đã đạt được.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Dành cho thợ ---------- */

const PARTNER_ICONS = { pin: MapPin, receipt: ReceiptText, cash: Banknote, store: Store } as const;

export function Partners() {
  return (
    <section className="section partners" id="doi-tac" aria-labelledby="partners-title">
      <div className="container partners__grid">
        <div>
          <Reveal as="p" className="eyebrow eyebrow--partner">
            Dành cho thợ và chủ tiệm
          </Reveal>
          <Reveal as="h2" index={1} id="partners-title" className="h2">
            Nhận đơn ngay gần chỗ bạn đang đứng
          </Reveal>
          <Reveal as="p" index={2} className="lead">
            Trở thành đối tác Fix&Go để có thêm khách mà không phải đi tìm. Hoa hồng nền tảng 8–11% trên giá trị đơn,
            hiển thị rõ trên từng đơn.
          </Reveal>

          <ul className="points">
            {PARTNER_POINTS.map((p, i) => {
              const Icon = PARTNER_ICONS[p.icon];
              return (
                <Reveal as="li" key={p.title} index={i + 3} className="point">
                  <span className="point__ico">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <b>{p.title}</b>
                    <span>{p.body}</span>
                  </span>
                </Reveal>
              );
            })}
          </ul>

          <Reveal index={7}>
            <PartnerCta />
          </Reveal>
        </div>

        <Reveal index={2} className="partners__visual">
          <div className="hero__blob hero__blob--blue" aria-hidden="true" />
          <Phone tone="partner" label="Màn hình nhận đơn trong app Thợ của Fix&Go (dữ liệu minh họa)">
            <ScreenPartnerOffer />
          </Phone>
          <p className="caption caption--light">Màn hình minh họa với dữ liệu mẫu.</p>
        </Reveal>
      </div>
    </section>
  );
}

function PartnerCta() {
  return LINKS.partnerApp ? (
    <a className="btn btn--partner btn--lg" href={LINKS.partnerApp} download>
      Tải app và đăng ký đối tác
    </a>
  ) : (
    <span className="btn btn--soon btn--lg" role="note">
      Đăng ký đối tác: sắp mở
    </span>
  );
}

/* ---------- Hỏi đáp ---------- */

export function Faq() {
  return (
    <section className="section" id="hoi-dap" aria-labelledby="faq-title">
      <div className="container faq">
        <div>
          <Reveal as="p" className="eyebrow">
            Câu hỏi thường gặp
          </Reveal>
          <Reveal as="h2" index={1} id="faq-title" className="h2">
            Những điều bạn có thể đang thắc mắc
          </Reveal>
        </div>
        <div className="faq__list">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} index={Math.min(i, 3)}>
              <details className="qa">
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tải app ---------- */

export function Download() {
  return (
    <section className="download" id="tai-app" aria-labelledby="download-title">
      <div className="container download__grid">
        <Reveal className="download__card download__card--customer">
          <h2 id="download-title" className="h2">
            Xe hỏng? Mở Fix&Go.
          </h2>
          <p>Gọi thợ gần bạn, xem giá trước, theo dõi thợ tới ngay trên điện thoại.</p>
          {LINKS.customerApp ? (
            <>
              <a className="btn btn--cta btn--lg" href={LINKS.customerApp} download>
                Tải app cho Android
              </a>
              <p className="download__note">
                Bản {APK.version} · {APK.sizeLabel} · chỉ dành cho Android (iPhone: sắp có). Mở file vừa tải để cài; nếu Android
                hỏi quyền cài ứng dụng từ nguồn ngoài, hãy cho phép cho trình duyệt bạn đang dùng.
              </p>
            </>
          ) : (
            <span className="btn btn--soon btn--lg" role="note">
              Sắp có trên cửa hàng ứng dụng
            </span>
          )}
        </Reveal>
        <Reveal index={1} className="download__card download__card--partner">
          <h2 className="h2">Là thợ hoặc chủ tiệm?</h2>
          <p>Đăng ký làm đối tác, nhận đơn quanh {BRAND.pilotArea} và thu tiền tại chỗ.</p>
          <PartnerCta />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Fix&Go" width={118} height={44} />
          <p>
            Nền tảng kết nối khách với thợ sửa xe máy. Fix&Go là bên trung gian, không trực tiếp sửa xe và không sở hữu
            đội thợ.
          </p>
        </div>
        <div>
          <h3>Khu vực</h3>
          <p>Đang thử nghiệm tại {BRAND.pilotArea}, TP.HCM.</p>
        </div>
        <div>
          <h3>Liên hệ</h3>
          {LINKS.hotline ? (
            <p>
              Hotline: <a href={`tel:${LINKS.hotline.replace(/\s/g, '')}`}>{LINKS.hotline}</a>
            </p>
          ) : null}
          {LINKS.social ? (
            <p>
              <a href={LINKS.social}>Zalo / Fanpage Fix&Go</a>
            </p>
          ) : null}
          {!LINKS.hotline && !LINKS.social ? <p>Thông tin liên hệ sẽ được cập nhật khi ra mắt.</p> : null}
        </div>
      </div>
      <div className="container footer__legal">
        <BadgeCheck size={16} aria-hidden="true" /> © {new Date().getFullYear()} Fix&Go. Đang trong giai đoạn thử nghiệm.
      </div>
    </footer>
  );
}
