# Thiết kế landing page Fix&Go

Làm theo hướng dẫn của hai skill `emil-design-eng` (chi tiết chuyển động) và `ui-ux-pro-max` (hệ thống thiết kế, trợ
năng, kiểm tra trước khi giao). Mẫu bố cục: "App Store Style Landing" kết hợp "Hero + Problem/Solution", bỏ khối
testimonial vì chưa có đánh giá thật.

## Màu

Lấy từ logo thật (xanh `#0D47A1`, cam `#F97316`), không dùng bảng tím do công cụ gợi ý vì lệch thương hiệu.

| Token | Giá trị | Dùng cho | Tương phản |
|---|---|---|---|
| `--ink` | `#0B1C30` | chữ chính, nền khối tối | 16:1 trên nền kem |
| `--muted` | `#475569` | chữ phụ | 7,2:1 |
| `--cta` | `#D2450B` | nút chính (chữ trắng) | 4,6:1 |
| `--ink-orange` | `#C2410C` | chữ/icon cam trên nền sáng | 4,9:1 |
| `--orange` | `#F97316` | trang trí, nền (không đặt chữ lên) | chữ trắng chỉ 2,8:1 nên cấm |
| `--blue` / `--blue-ink` | `#0D47A1` / `#1D4ED8` | khu vực thợ, nền khối tải app | 8,6:1 / 6,1:1 |

Khách là màu cam, thợ là màu xanh, đúng như trong app Mobile.

## Chữ

Be Vietnam Pro (thiết kế cho tiếng Việt, đủ dấu), 400 đến 800. Cỡ chữ nội dung 16 px, dòng 1,6; tiêu đề `clamp()` để
co giãn, `text-wrap: balance`.

## Chuyển động

| Quy tắc | Áp dụng |
|---|---|
| Ease-out mạnh `cubic-bezier(0.23, 1, 0.32, 1)` | mọi chuyển động vào màn hình và nhấn nút |
| Dưới 500 ms | khối hiện dần 480 ms, nút 160 ms, đổi màn hình điện thoại 160 ms |
| Chỉ `opacity` / `transform` | không animate width, height, margin |
| Nhấn nút co `scale(0.97)` | `.btn`, `.step` |
| Stagger 60 ms | các khối cùng nhóm khi hiện |
| Hover chỉ khi có chuột | `@media (hover: hover) and (pointer: fine)` |
| Giảm chuyển động | bỏ phần trượt, vòng radar và vòng mở rộng đứng yên, cảnh 3D chỉ vẽ một khung, giữ mờ nhẹ |
| Không tự chuyển nội dung | tab "Cách hoạt động" chỉ đổi khi người dùng chọn, không tự xoay |

Chuyển động có mục đích: vòng mở rộng ở mục "Ghép thợ" giải thích cách đơn lan ra xa hơn; radar ở màn hình "đang tìm
thợ" thể hiện trạng thái chờ. Khu vực đọc nội dung không có hiệu ứng trang trí lặp vô hạn; vòng lặp duy nhất là hoạt cảnh hero, có nút tạm dừng.

## Hoạt cảnh 3D ở hero ("một chuyến cứu hộ")

Làm theo hướng dẫn của skill `3dviz-pro-max` (lập luận từ đối tượng ra cảnh; không dùng kit hay tệp 3D có sẵn).
Cảnh low-poly dựng hoàn toàn bằng code Three.js trong `src/scene/rescueScene.ts`:

- **Đối tượng chính:** xe tay ga có thân là một đường viền nhìn nghiêng đùn ra (vát cạnh bắt sáng), bánh có vạch để
  thấy quay, càng trước, ghi đông, đèn pha/đèn cảnh báo; xe thợ có hộp đồ nghề và người lái; người khách vẫy tay.
- **Một nguồn sự thật:** biến `time` (giây trong chu kỳ 14,4 s) quyết định vị trí xe thợ trên đường cong, vòng quay
  bánh (theo quãng đường đã đi, nên tua hay tạm dừng vẫn khớp), nghiêng xe khi vào cua, đèn nháy, ghim, vòng sóng,
  bánh răng. Thẻ trạng thái ngoài DOM ("Đang tìm thợ → Đã nhận → Đang đến → Đã tới → Sửa chữa", thời gian còn lại)
  suy ra từ cùng pha đó, nên chữ và hình luôn khớp nhau.
- **Mỗi chuyển động có nghĩa:** vòng sóng lan ra = đang ghép thợ; vạch xanh đứt tan dần theo xe = đường thợ đi;
  vòng xanh = đã tới; bánh răng quay = đang sửa; đèn cảnh báo ngừng nháy và đèn pha bật = xe đã ổn.
- **Điều khiển:** nút tạm dừng/phát lại (44 px, `aria-pressed`) vì chuyển động tự lặp quá 5 giây. Con trỏ và cuộn trang
  xoay nhẹ mô hình (làm mượt theo hàm mũ). Chỉ vẽ khi cảnh nằm trong màn hình và tab đang mở.
- **Giảm chuyển động:** vẽ đúng một khung hình ở pha "đang sửa", không lặp, không xoay theo con trỏ, ẩn nút tạm dừng.
- **Dự phòng:** mã three.js (~150 KB nén) tải sau bằng import động; chưa tải xong hoặc trình duyệt không có WebGL
  thì vẫn còn nền và thẻ trạng thái, trang không trống.
- **Kiểm tra từng pha:** thêm `?scene-t=<giây>` vào URL để cố định cảnh ở một thời điểm (0 đến 14,4).

Các hiệu ứng cuộn khác: tiêu đề hiện từng từ (trượt qua một "cửa sổ", chừa đệm cho dấu tiếng Việt), thanh tiến trình
cuộn ở mép dưới header, các con số mục tiêu đếm từ 0 khi cuộn tới (mặc định hiện giá trị cuối nếu không có JS hoặc
bật giảm chuyển động).

## Trợ năng

- Liên kết "Bỏ qua, tới nội dung chính", viền focus 3 px, vùng chạm tối thiểu 44 px.
- Tab "Cách hoạt động" dùng `role="tablist"`, hỗ trợ phím mũi tên, Home, End.
- FAQ dùng `<details>` thuần, hoạt động cả khi tắt JavaScript.
- Khung điện thoại là hình minh họa: `figure` có `aria-label`, nội dung bên trong `aria-hidden`.
- Không dùng màu làm tín hiệu duy nhất; icon SVG (Lucide), không dùng emoji.

## Cố ý không làm

- Không bịa đánh giá, số người dùng, logo đối tác hay số liệu "đã đạt".
- Không có nút tải app giả: chưa có link thì hiện "Sắp ra mắt" (cấu hình ở `src/config.ts`).
- Không có chế độ tối: trang giới thiệu chỉ cần một chế độ sáng, tránh phải kiểm lại toàn bộ tương phản.
- Không hứa phí hủy hay giờ hoạt động, vì BRD chưa chốt.
