/**
 * Liên kết ra ngoài của landing page. Để trống thì nút tương ứng hiện trạng thái "Sắp ra mắt"
 * thay vì dẫn tới trang chết. Điền khi app lên cửa hàng / có form đăng ký.
 */
export const LINKS: Record<'customerApp' | 'partnerApp' | 'webApp' | 'hotline' | 'social', string> = {
  /** Link tải app khách (Google Play / App Store / trang TestFlight). */
  customerApp: 'https://github.com/EXE201-Fix-Go/Landing-Page/releases/download/V1.5.6/FixAndGo1.5.6.apk',
  /** Link tải app thợ hoặc form đăng ký đối tác. */
  partnerApp: 'https://github.com/EXE201-Fix-Go/Landing-Page/releases/download/V1.5.6/FixAndGo1.5.6.apk',
  /** Bản web đã deploy, cho nút "Trải nghiệm thử" (không cần cài app). */
  webApp: 'https://fixandgo.online',
  /** Hotline hiển thị ở footer, ví dụ '0900 000 000'. */
  hotline: '',
  /** Zalo OA / fanpage. */
  social: 'https://www.facebook.com/profile.php?id=61595273016607',
};

/** Hiện cạnh nút tải khi LINKS.customerApp là một file APK. Cập nhật khi đổi file. */
export const APK = { version: '1.5.6', sizeLabel: '104 MB' } as const;

export const BRAND = {
  name: 'Fix&Go',
  pilotArea: 'Làng Đại học, Thủ Đức',
} as const;
