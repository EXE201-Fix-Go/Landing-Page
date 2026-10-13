# Fix&Go Landing Page

Trang giới thiệu Fix&Go (marketplace cứu hộ xe máy, đang pilot tại Làng Đại học, Thủ Đức) cho cả khách và thợ.
Một trang tĩnh: Vite + React 19 + TypeScript, CSS thuần, không có backend.

## Chạy

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:5173
npm run lint       # kiểm tra kiểu TypeScript
npm run build      # ra thư mục dist/
```

Node 20 trở lên.

## Chỉnh nội dung

| Cần đổi | Sửa ở đâu |
|---|---|
| Link tải app, link đăng ký thợ, hotline, Zalo | `src/config.ts` (để trống thì nút hiện "Sắp ra mắt", footer ẩn mục đó) |
| Chữ, giá dịch vụ, câu hỏi thường gặp, các bước | `src/content.ts` |
| Màu, khoảng cách, chuyển động | `src/index.css` (token ở `:root`) |
| Màn hình minh họa trong khung điện thoại | `src/components/Phone.tsx` |
| Hoạt cảnh 3D ở hero (timeline, xe, đường phố) | `src/scene/rescueScene.ts`, thẻ trạng thái ở `src/components/RescueStage.tsx` |

Giá và phí trong `content.ts` lấy từ seed dịch vụ của BE (`V2__seed_reference_data.sql`, `V3__more_services.sql`) và
`docs/BRD.md` v1.4. Khi BE đổi giá, cập nhật lại ở đây. Dịch vụ chưa có thợ phục vụ (tiếp xăng, vệ sinh sên) cố ý
chưa đưa lên trang.

## Triển khai

`.github/workflows/deploy.yml` tự deploy lên GitHub Pages khi push `main`. Bật một lần ở
Settings → Pages → Source: **GitHub Actions**. Trang sẽ ở `https://exe201-fix-go.github.io/Landing-Page/`.
Có tên miền riêng thì tạo biến Actions `VITE_BASE` = `/`.

## Hoạt cảnh 3D

Hero có cảnh Three.js tự dựng (không có tệp 3D ngoài). Thêm `?scene-t=6.5` vào URL để cố định cảnh ở giây thứ 6,5
(0 = đang tìm thợ, 3,5 đến 9,2 = thợ đang chạy, 9,2 = đã tới, 10,4 trở đi = đang sửa) khi cần chụp ảnh kiểm tra.

## Thiết kế

Xem [docs/DESIGN.md](docs/DESIGN.md): bảng màu và tỉ lệ tương phản, chữ, chuyển động, những điều cố ý không làm.

## Ghi chú nội dung

- Trang không có đánh giá, số liệu người dùng hay logo đối tác vì chưa có dữ liệu thật. Khối "Mục tiêu vận hành" ghi rõ
  đó là chỉ tiêu, chưa phải kết quả.
- Các màn hình trong khung điện thoại dựng bằng HTML/CSS với dữ liệu mẫu, không dùng ảnh chụp thật để khỏi lộ tài khoản thử nghiệm.
