import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Mặc định './' (đường dẫn tương đối): cùng một bản build chạy được ở https://<org>.github.io/Landing-Page/ lẫn ở gốc tên miền riêng,
  // nên đổi tên miền không cần build lại theo thứ tự. Trang không có route con nên tương đối là đủ.
  base: process.env.VITE_BASE?.trim() || './',
  plugins: [react()],
});
