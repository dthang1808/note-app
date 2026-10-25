# Paper — Note App

Ứng dụng ghi chú với React, Vite, Node.js, Express và MongoDB. Mã nguồn được chia thành `client/` và `server/`.

## Yêu cầu

- Node.js 20.19 trở lên
- MongoDB local hoặc MongoDB Atlas

## Chạy ứng dụng

1. Tạo `server/.env` dựa trên `server/.env.example`, rồi đặt `MONGODB_URI` thành MongoDB connection string của bạn. Tên database mặc định là `note_app`; có thể đổi bằng `MONGODB_DB_NAME`.
2. Tạo `JWT_SECRET` ngẫu nhiên, tối thiểu 32 byte, và đặt `CLIENT_URL` thành địa chỉ frontend. Có thể tạo secret bằng `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
3. Có thể đặt `INITIAL_USER_USERNAME` và `INITIAL_USER_PASSWORD` để tạo tài khoản đầu tiên khi server khởi động. Ghi chú từ phiên bản trước sẽ được gán cho tài khoản ban đầu này; nếu không cấu hình, ghi chú cũ vẫn được giữ trong MongoDB nhưng không hiển thị cho tài khoản mới.
4. Cài dependencies từ thư mục gốc và chạy frontend/backend:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`). API chạy tại `http://localhost:3001`; frontend chuyển tiếp request `/api` tới API.

Nếu server báo `querySrv ECONNREFUSED` khi khởi động, Node.js có thể đang dùng DNS resolver cục bộ không phản hồi. Đặt `MONGODB_DNS_SERVERS` trong `server/.env` thành danh sách địa chỉ DNS đang hoạt động trên mạng của bạn, phân cách bằng dấu phẩy. Trên Windows, xem các địa chỉ này bằng `Get-DnsClientServerAddress -AddressFamily IPv4`; server dùng cấu hình này để phân giải Atlas SRV.

## Tài khoản

- Người dùng có thể đăng ký và đăng nhập bằng username/mật khẩu.
- Username dài 3–32 ký tự; mật khẩu dài 12–72 ký tự.
- Mật khẩu được băm bằng bcrypt; phiên đăng nhập dùng cookie `HttpOnly` hết hạn sau 7 ngày.
- Ghi chú được giới hạn theo tài khoản; người dùng không thể đọc hoặc sửa ghi chú của người khác.
- Khi deploy, đặt `JWT_SECRET`, `CLIENT_URL` và thông tin MongoDB trong phần environment variables của hosting. Không đưa `server/.env` lên GitHub.
- Cookie production yêu cầu HTTPS và `CLIENT_URL` phải khớp chính xác origin frontend (ví dụ `https://your-app.vercel.app`).
- Trên Render, đặt `NODE_ENV=production`. Nếu có ghi chú từ phiên bản cũ, đặt thêm `INITIAL_USER_USERNAME` và `INITIAL_USER_PASSWORD` giống nhau trong suốt lần khởi động để gán dữ liệu cũ cho đúng tài khoản.

## Scripts

- `npm run dev`: chạy client và server đồng thời.
- `npm run client`: chỉ chạy Vite.
- `npm run server`: chỉ chạy API ở chế độ watch.
- `npm run build`: build client production.
- `npm start`: chạy server production.

## Tính năng

- Tạo, chỉnh sửa, ghim, xóa và tìm kiếm ghi chú.
- Lưu dữ liệu trong MongoDB.
