/**
 * Liên kết ra ngoài của landing page. Để trống thì nút tương ứng hiện trạng thái "Sắp ra mắt"
 * thay vì dẫn tới trang chết. Điền khi app lên cửa hàng / có form đăng ký.
 */
export const LINKS: Record<'customerApp' | 'partnerApp' | 'hotline' | 'social', string> = {
  /** Link tải app khách (Google Play / App Store / trang TestFlight). */
  customerApp: '',
  /** Link tải app thợ hoặc form đăng ký đối tác. */
  partnerApp: '',
  /** Hotline hiển thị ở footer, ví dụ '0900 000 000'. */
  hotline: '',
  /** Zalo OA / fanpage. */
  social: '',
};

export const BRAND = {
  name: 'Fix&Go',
  pilotArea: 'Làng Đại học, Thủ Đức',
} as const;
