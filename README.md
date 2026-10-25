# Paper — Note App

Ứng dụng ghi chú đơn giản với React, Vite và Node.js/Express. Ghi chú được lưu trong `server/data/notes.json`.

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`). API chạy tại `http://localhost:3001`.

## Tính năng

- Tạo, chỉnh sửa, ghim và xóa ghi chú.
- Tìm kiếm theo tiêu đề và nội dung; lọc ghi chú đã ghim.
- Lưu dữ liệu qua API vào tệp JSON trên máy chủ.
- Chạy bản production bằng `npm run build`, sau đó `npm start` để chạy API.

