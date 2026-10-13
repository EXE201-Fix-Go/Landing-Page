/**
 * Nội dung của landing page, tách khỏi giao diện để chỉnh chữ không phải đụng vào component.
 * Nguồn số liệu: docs/BRD.md v1.4 (EXE201) và seed dịch vụ của BE (V2 + V3). Giá là giá cơ bản "từ";
 * giá cuối cùng luôn do thợ báo và khách duyệt trong app.
 */

export const NAV = [
  { href: '#cach-hoat-dong', label: 'Cách hoạt động' },
  { href: '#dich-vu', label: 'Dịch vụ & giá' },
  { href: '#doi-tac', label: 'Dành cho thợ' },
  { href: '#hoi-dap', label: 'Câu hỏi' },
] as const;

export type ServiceIcon = 'tire' | 'pump' | 'tube' | 'battery' | 'chain' | 'oil' | 'tow' | 'brake' | 'light' | 'plug';

export interface Service {
  icon: ServiceIcon;
  name: string;
  hint: string;
  /** VND, giá cơ bản "từ". */
  price: number;
  note?: string;
}

/** Chỉ liệt kê dịch vụ đang có thợ phục vụ. Tiếp xăng / vệ sinh sên chưa mở nên chưa đưa lên trang. */
export const SERVICES: Service[] = [
  { icon: 'tire', name: 'Vá xe lưu động', hint: 'Thủng lốp, cán đinh', price: 80_000 },
  { icon: 'pump', name: 'Bơm lốp tận nơi', hint: 'Non hơi, xuống lốp', price: 50_000 },
  { icon: 'tube', name: 'Thay ruột xe', hint: 'Xe số 130k · tay ga 160k', price: 130_000 },
  { icon: 'battery', name: 'Kích bình ắc quy', hint: 'Hết điện, không đề được', price: 80_000 },
  { icon: 'chain', name: 'Tăng sên', hint: 'Tuột xích, kẹt sên', price: 60_000 },
  { icon: 'oil', name: 'Thay nhớt tận nơi', hint: 'Cạn nhớt, bó máy dọc đường', price: 180_000 },
  { icon: 'brake', name: 'Sửa / chỉnh phanh', hint: 'Phanh ăn kém, kẹt phanh', price: 90_000 },
  { icon: 'light', name: 'Sửa đèn, còi, xi-nhan', hint: 'Đèn không sáng, còi hỏng', price: 70_000 },
  { icon: 'plug', name: 'Thay bugi', hint: 'Xe yếu, khó nổ', price: 60_000 },
  { icon: 'tow', name: 'Chở / kéo xe về tiệm', hint: 'Hỏng nặng, không sửa được tại chỗ', price: 60_000, note: '+10–12k mỗi km' },
];

/** Phí gọi thợ toàn hệ thống (call_out_fee_configs, GLOBAL). */
export const CALL_OUT_FEE = 30_000;

export const STEPS = [
  {
    title: 'Chọn sự cố, ghim vị trí',
    body: 'Chọn dịch vụ, ghim vị trí trên bản đồ (địa chỉ sửa tay được vì GPS hay lệch ở hẻm) và xác nhận phí gọi thợ.',
  },
  {
    title: 'Ghép thợ gần nhất',
    body: 'Yêu cầu được gửi cùng lúc tới các thợ phù hợp quanh bạn. Thợ nhận trước được giao đơn, không ai phải chờ ai.',
  },
  {
    title: 'Thợ đến, theo dõi trực tiếp',
    body: 'Xem thợ đang tới, gọi thẳng cho thợ khi cần. Thợ kiểm tra xe rồi gửi báo giá ngay trong app.',
  },
  {
    title: 'Bạn duyệt giá, thợ mới sửa',
    body: 'Thợ chỉ bắt tay vào việc sau khi bạn đồng ý. Phát sinh thêm thì phải có báo giá mới và bạn duyệt lại.',
  },
  {
    title: 'Thanh toán, đánh giá',
    body: 'Trả tiền mặt hoặc chuyển khoản trực tiếp cho thợ, bấm "Đã thanh toán" và để lại đánh giá.',
  },
] as const;

export const TRUST = [
  {
    icon: 'shield',
    title: 'Thợ được xác minh',
    body: 'Mọi đối tác phải qua xác minh danh tính (KYC) trước khi nhận đơn. Hồ sơ lưu trữ riêng tư, không công khai.',
  },
  {
    icon: 'receipt',
    title: 'Biết giá trước khi sửa',
    body: 'Không có chuyện sửa xong mới báo giá. Mọi khoản phát sinh đều cần báo giá mới và sự đồng ý của bạn.',
  },
  {
    icon: 'camera',
    title: 'Có ảnh bằng chứng',
    body: 'Khi dắt, kéo hoặc gửi xe, thợ chụp lại tình trạng xe để hai bên đều có căn cứ.',
  },
  {
    icon: 'history',
    title: 'Mọi lần hủy đều có ghi nhận',
    body: 'Ai hủy, lúc nào, vì sao đều được lưu lại để xử lý công bằng nếu có tranh chấp.',
  },
] as const;

export const TARGETS = [
  { value: '< 2 phút', label: 'Ghép được thợ' },
  { value: '10–15 phút', label: 'Thợ đến nơi' },
  { value: '> 90%', label: 'Đơn hoàn thành' },
  { value: '≥ 4,5 sao', label: 'Đánh giá thợ' },
] as const;

export const PARTNER_POINTS = [
  { icon: 'pin', title: 'Đơn ở ngay gần bạn', body: 'Đơn gửi tới thợ đang sẵn sàng quanh khu vực, nhận trước được giao trước.' },
  { icon: 'receipt', title: 'Khách duyệt giá trước', body: 'Báo giá rõ ràng, khách đồng ý rồi mới làm. Hết cảnh cãi giá lúc thanh toán.' },
  { icon: 'cash', title: 'Thu tiền tại chỗ', body: 'Nhận tiền mặt hoặc chuyển khoản trực tiếp từ khách, không phải chờ đối soát từng đơn.' },
  { icon: 'store', title: 'Cho thợ độc lập và chủ tiệm', body: 'Thợ tự do, chủ tiệm hay thợ thuộc tiệm đều có chỗ. Chủ tiệm điều đơn cho thợ của mình.' },
] as const;

export const FAQ = [
  {
    q: 'Fix&Go có trực tiếp sửa xe không?',
    a: 'Không. Fix&Go là nền tảng kết nối: bạn tạo yêu cầu, thợ độc lập hoặc tiệm sửa xe đã xác minh sẽ đến và trực tiếp sửa. Fix&Go lo phần ghép thợ, báo giá minh bạch, theo dõi đơn và xử lý khi có tranh chấp.',
  },
  {
    q: 'Giá được tính như thế nào?',
    a: 'Tổng tiền = phí gọi thợ + công + linh kiện + phụ thu - giảm giá. Thợ kiểm tra xe rồi gửi báo giá, bạn xem và đồng ý thì mới sửa. Nếu có việc phát sinh, thợ phải gửi báo giá mới để bạn duyệt lại; các báo giá không cộng dồn lên nhau.',
  },
  {
    q: 'Nếu không có thợ nào nhận đơn thì sao?',
    a: 'Sau khoảng 60 đến 90 giây không ai nhận, hệ thống tự mở rộng vùng tìm thợ. Nếu hết các vòng vẫn chưa có thợ, bạn được báo ngay trong app cùng các lựa chọn: thử lại, đổi dịch vụ hoặc gọi hotline. Bạn không bị để chờ vô vọng.',
  },
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Giai đoạn thử nghiệm, bạn trả tiền mặt hoặc chuyển khoản trực tiếp cho thợ rồi bấm "Đã thanh toán" trên app. Chưa có cổng thanh toán trực tuyến.',
  },
  {
    q: 'Xe không sửa được tại chỗ thì làm gì?',
    a: 'Thợ sẽ đề xuất dắt xe đi quãng ngắn, chở hoặc kéo xe về tiệm, hoặc gửi xe an toàn. Chi phí của các phương án này nằm trong báo giá và bạn phải đồng ý trước khi thợ thực hiện.',
  },
  {
    q: 'Fix&Go phục vụ ở đâu?',
    a: 'Hiện Fix&Go đang chạy thử nghiệm (pilot) tại Làng Đại học, Thủ Đức, TP.HCM. Khu vực sẽ mở rộng dần khi có thêm thợ.',
  },
  {
    q: 'Đăng nhập có cần mật khẩu không?',
    a: 'Không. Bạn chỉ cần số điện thoại và mã OTP gửi qua SMS. Fix&Go không lưu mật khẩu của bất kỳ ai.',
  },
] as const;

export const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;
