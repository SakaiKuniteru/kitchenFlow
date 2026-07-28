# KitchenFlow

## Giới thiệu

KitchenFlow là hệ thống quản lý suất ăn dành cho doanh nghiệp, hỗ trợ quản lý nhân viên, phân quyền, cơ sở, nhà ăn, ca ăn, bình chọn suất ăn, voucher và các chính sách hỗ trợ.

Dự án được phát triển bằng **Node.js + Express + PostgreSQL** theo mô hình nhiều tầng (Controller → Service → Repository) nhằm dễ bảo trì và mở rộng.

---

# Công nghệ sử dụng

## Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- Joi
- jsonwebtoken
- MD5
- Helmet
- CORS
- Morgan
- Cookie Parser

---

# Yêu cầu môi trường

Cần cài đặt:

- Node.js >= 22
- PostgreSQL >= 17
- Git

Kiểm tra phiên bản:

```bash
node -v
npm -v
psql --version
git --version
```

---

# Clone project

```bash
git clone https://github.com/SakaiKuniteru/ketchenFlow.git
```

```bash
cd ketchenFlow
```

---

# Cài đặt package

```bash
npm install
```

---

# Cấu hình môi trường

Tạo file `.env`

Ví dụ:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kitchenflow
DB_USER=postgres
DB_PASSWORD=123456

JWT_SECRET=your-secret-key
JWT_EXPIRES=1d
```

---

# Khởi tạo Database

Tạo database

```sql
CREATE DATABASE kitchenflow;
```

Import file SQL

```bash
psql -U postgres -d kitchenflow -f database.sql
```

---

# Seed dữ liệu

```bash
node src/seeds/index.js
```

---

# Chạy dự án

```bash
npm start
```

Server mặc định:

```
http://localhost:3000
```

---

# Quy tắc chung

## Kiến trúc

Dự án được tổ chức theo mô hình:

```
Route
    ↓
Validation
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

## Quy tắc đặt tên

### Bảng

- `dm_` : Danh mục
- `nv_` : Nghiệp vụ
- `ct_` : Chi tiết

Ví dụ:

```
dm_nhan_vien

nv_dot_binh_chon

ct_binh_chon_suat_an
```

---

### Cột

Database sử dụng:

```
snake_case
```

Ví dụ

```
ten_nhan_vien
```

Javascript sử dụng:

```
camelCase
```

Ví dụ

```
tenNhanVien
```

---

## Soft Delete

Không xóa dữ liệu khỏi hệ thống.

Sử dụng trường:

```
active
```

- `true`: Đang sử dụng
- `false`: Đã khóa

---

## Quy tắc phát triển

- Không viết SQL trong Controller.
- Repository chỉ thao tác Database.
- Service xử lý nghiệp vụ.
- Validation sử dụng Joi.
- Mỗi module gồm:
  - route
  - validation
  - controller
  - service
  - repository

---

## Cấu trúc thư mục

```
src
├── config
├── constants
├── middlewares
├── modules
├── routes
├── seeds
├── utils
├── views
└── public
```

---

## Tác giả

Phạm Quốc Huy