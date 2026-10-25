# Paper — Note App

Ứng dụng ghi chú với React, Vite, Node.js, Express và MongoDB. Mã nguồn được chia thành `client/` và `server/`.

## Yêu cầu

- Node.js 20.19 trở lên
- MongoDB local hoặc MongoDB Atlas

## Chạy ứng dụng

1. Tạo `server/.env` dựa trên `server/.env.example`, rồi đặt `MONGODB_URI` thành MongoDB connection string của bạn. Tên database mặc định là `note_app`; có thể đổi bằng `MONGODB_DB_NAME`.
2. Cài dependencies từ thư mục gốc và chạy frontend/backend:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`). API chạy tại `http://localhost:3001`; frontend chuyển tiếp request `/api` tới API.

Nếu server báo `querySrv ECONNREFUSED` khi khởi động, Node.js có thể đang dùng DNS resolver cục bộ không phản hồi. Đặt `MONGODB_DNS_SERVERS` trong `server/.env` thành danh sách địa chỉ DNS đang hoạt động trên mạng của bạn, phân cách bằng dấu phẩy. Trên Windows, xem các địa chỉ này bằng `Get-DnsClientServerAddress -AddressFamily IPv4`; server dùng cấu hình này để phân giải Atlas SRV.

## Scripts

- `npm run dev`: chạy client và server đồng thời.
- `npm run client`: chỉ chạy Vite.
- `npm run server`: chỉ chạy API ở chế độ watch.
- `npm run build`: build client production.
- `npm start`: chạy server production.

## Tính năng

- Tạo, chỉnh sửa, ghim, xóa và tìm kiếm ghi chú.
- Lưu dữ liệu trong MongoDB.
- Tự động nhập ghi chú từ `server/data/notes.json` khi database chưa có ghi chú; tệp JSON được giữ nguyên làm bản dự phòng.
