/**
 * Liên kết ra ngoài của landing page. Để trống thì nút tương ứng hiện trạng thái "Sắp ra mắt"
 * thay vì dẫn tới trang chết. Điền khi app lên cửa hàng / có form đăng ký.
 */
export const LINKS: Record<'customerApp' | 'partnerApp' | 'hotline' | 'social', string> = {
  /** Link tải app khách (Google Play / App Store / trang TestFlight). */
  customerApp: 'https://github.com/EXE201-Fix-Go/Landing-Page/releases/download/V1.0/FixAndGo1.0.apk',
  /** Link tải app thợ hoặc form đăng ký đối tác. */
  partnerApp: 'https://github.com/EXE201-Fix-Go/Landing-Page/releases/download/V1.0/FixAndGo1.0.apk',
  /** Hotline hiển thị ở footer, ví dụ '0900 000 000'. */
  hotline: '',
  /** Zalo OA / fanpage. */
  social: '',
};

/** Hiện cạnh nút tải khi LINKS.customerApp là một file APK. Cập nhật khi đổi file. */
export const APK = { version: '1.0', sizeLabel: '104 MB' } as const;

export const BRAND = {
  name: 'Fix&Go',
  pilotArea: 'Làng Đại học, Thủ Đức',
} as const;
