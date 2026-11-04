# HỆ THỐNG QUẢN LÝ THIẾT BỊ PHÒNG HỌC

## 1. Thông tin sinh viên
- Họ tên: Ngô Tuấn Kiệt
- MSSV: 234672
- Học phần: Điện toán đám mây

## 2. Giới thiệu đề tài
Xây dựng hệ thống quản lý thiết bị phòng học
trên nền tảng điện toán đám mây.

Hệ thống cho phép quản lý thông tin,
số lượng và tình trạng sử dụng thiết bị.

## 3. Chức năng
- Xem danh sách thiết bị
- Xem chi tiết thiết bị
- Thêm thiết bị
- Cập nhật thiết bị
- Xóa thiết bị
- Tìm kiếm thiết bị
- Theo dõi tình trạng thiết bị

## 4. Công nghệ sử dụng
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Quản lý mã nguồn: Git/GitHub
- Container: Docker, Docker Hub
- Triển khai: Render

## 5. Cấu trúc dự án
- backend/: REST API
- frontend/: Giao diện React

## 6. Hướng dẫn cài đặt
Sẽ cập nhật sau khi hoàn thành Backend
và Frontend.
## 7. MongoDB Atlas

### Thông tin cơ sở dữ liệu
- Project: 234672_NgoTuanKiet
- Cluster: Cluster0
- Database: 234672_NgoTuanKiet
- Collection: devices

### Các thiết bị mẫu
- TB001: Máy chiếu Epson
- TB002: Máy tính Dell
- TB003: Loa JBL

### Các trạng thái thiết bị
- Đang sử dụng
- Hư hỏng
- Đang sửa chữa
- Ngừng sử dụng
## 8. Frontend React

### Công nghệ
- React
- Vite
- HTML, CSS, JavaScript
- Fetch API

### Chức năng
- Hiển thị danh sách thiết bị
- Xem chi tiết thiết bị
- Thêm thiết bị
- Cập nhật thiết bị
- Xóa thiết bị
- Tìm kiếm thiết bị
- Quản lý tình trạng thiết bị

### Cài đặt và chạy

cd frontend
npm install
npm run dev

### Địa chỉ truy cập

http://localhost:5173

### Kết nối Backend

Backend chạy tại http://localhost:5000

Cấu hình địa chỉ Backend trong public/config.js