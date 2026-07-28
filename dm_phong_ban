/q
\q
CREATE DATABASE kitchenflow_db;
\q
\dt
\dt public.*
\q
select * from dm_nhan_vien;
\q
CREATE DATABASE kitchenflow;
CREATE DATABASE kitchenflow;
\l
\c kitchenflow
\c kitchenflow
\c kitchenflow
\dt
\q
SELECT current_database();
\l
\c kitchenflow
\l
SELECT current_user;
\c kitchenflow
\dt
\q
\c KitchenFlow
\c quochuy
\c KitchenFlow
\l
\c kitchenflow
\d dm_quyen
\d dm_vai_tro_quyen
\d dm_co_so
ALTER TABLE dm_nhan_vien
DROP COLUMN ten_dang_nhap;

ALTER TABLE dm_nhan_vien
DROP COLUMN mat_khau;

ALTER TABLE dm_nhan_vien
DROP COLUMN lan_dang_nhap_cuoi;
CREATE TABLE dm_tai_khoan
(
    id                      SERIAL PRIMARY KEY,

    nhan_vien_id            INT NOT NULL UNIQUE,

    ten_dang_nhap           VARCHAR(100) NOT NULL UNIQUE,

    mat_khau_hash           TEXT NOT NULL,

    so_lan_dang_nhap_sai    SMALLINT NOT NULL DEFAULT 0,

    khoa_den                TIMESTAMP NULL,

    lan_dang_nhap_cuoi      TIMESTAMP NULL,

    doi_mat_khau_lan_cuoi   TIMESTAMP NULL,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_dm_tai_khoan_nhan_vien
        FOREIGN KEY (nhan_vien_id)
        REFERENCES dm_nhan_vien(id)
        ON DELETE CASCADE
);
\d dm_tai_khoan
SELECT
    ten_dang_nhap,
    active
FROM dm_tai_khoan;
\d
\d dm_nhan_vien
ALTER TABLE dm_nhan_vien
DROP COLUMN vai_tro_id;
CREATE TABLE dm_nhan_vien_vai_tro
(
    id                  SERIAL PRIMARY KEY,

    nhan_vien_id        INT NOT NULL,

    vai_tro_id          INT NOT NULL,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_nv_vai_tro_nhan_vien
        FOREIGN KEY (nhan_vien_id)
        REFERENCES dm_nhan_vien(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_nv_vai_tro_vai_tro
        FOREIGN KEY (vai_tro_id)
        REFERENCES dm_vai_tro(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_nv_vai_tro
        UNIQUE(nhan_vien_id, vai_tro_id)
);
CREATE TRIGGER trg_dm_nhan_vien_vai_tro_updated_at
BEFORE UPDATE
ON dm_nhan_vien_vai_tro
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
CREATE TRIGGER trg_dm_nhan_vien_vai_tro_updated_at
BEFORE UPDATE
ON dm_nhan_vien_vai_tro
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
don_vi_tinh_id INT NOT NULL
REFERENCES dm_don_vi_tinh(id)
ALTER TABLE dm_don_vi_tinh
ADD COLUMN loai_don_vi VARCHAR(30);
\r
ALTER TABLE dm_don_vi_tinh
ADD COLUMN loai_don_vi VARCHAR(30);
UPDATE dm_don_vi_tinh
SET loai_don_vi='KHOI_LUONG'
WHERE ma_don_vi_tinh IN ('KG','G');

UPDATE dm_don_vi_tinh
SET loai_don_vi='THE_TICH'
WHERE ma_don_vi_tinh IN ('L','ML');

UPDATE dm_don_vi_tinh
SET loai_don_vi='BAO_BI'
WHERE ma_don_vi_tinh IN ('BAO','TUI','THUNG','CHAI','HOP','GOI');

UPDATE dm_don_vi_tinh
SET loai_don_vi='DEM'
WHERE ma_don_vi_tinh IN ('CAI','QUA');
ALTER TABLE dm_thuc_pham
DROP COLUMN don_vi_tinh_id;
ALTER TABLE dm_thuc_pham

ADD COLUMN don_vi_so_cap_id INT,

ADD COLUMN don_vi_su_dung_id INT,

ADD COLUMN he_so_quy_doi NUMERIC(12,2) DEFAULT 1;
ALTER TABLE dm_thuc_pham

ADD CONSTRAINT fk_tp_dv_so_cap

FOREIGN KEY (don_vi_so_cap_id)

REFERENCES dm_don_vi_tinh(id);
ALTER TABLE dm_thuc_pham

ADD CONSTRAINT fk_tp_dv_su_dung

FOREIGN KEY (don_vi_su_dung_id)

REFERENCES dm_don_vi_tinh(id);
node src/seeds/index.js
node src/seeds/index.js
\r
\rnode src/seeds/index.j
node src/seeds/index.js
\r
node src/seeds/index.js
\r
node src/seeds/index.js
\r
\d dm_voucher
CREATE TABLE dm_voucher
(

    id                  SERIAL PRIMARY KEY,

    ma_voucher          VARCHAR(50) NOT NULL UNIQUE,

    ten_voucher         VARCHAR(255) NOT NULL,

    mo_ta               TEXT,

    loai_giam           VARCHAR(20) NOT NULL,

    gia_tri             NUMERIC(18,2) NOT NULL,

    so_luong            INT NOT NULL DEFAULT 0,

    da_su_dung          INT NOT NULL DEFAULT 0,

    gia_tri_don_toi_thieu NUMERIC(18,2),

    ngay_bat_dau        TIMESTAMP,

    ngay_ket_thuc       TIMESTAMP,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_voucher_loai
        CHECK (loai_giam IN ('PHAN_TRAM','SO_TIEN'))

);
\d
CREATE TABLE nv_phieu_nhap
(

    id                      SERIAL PRIMARY KEY,

    ma_phieu_nhap           VARCHAR(50) NOT NULL UNIQUE,

    kho_id                  INT NOT NULL,

    nhan_vien_id            INT NOT NULL,

    ngay_nhap               TIMESTAMP NOT NULL,

    tong_so_mat_hang        INT NOT NULL DEFAULT 0,

    tong_so_luong           NUMERIC(18,3) NOT NULL DEFAULT 0,

    tong_tien               NUMERIC(18,2) NOT NULL DEFAULT 0,

    nguoi_giao              VARCHAR(255),

    nguoi_nhan              VARCHAR(255),

    hinh_thuc_nhap          VARCHAR(30) NOT NULL,

    ghi_chu                 TEXT,

    trang_thai              VARCHAR(30) NOT NULL DEFAULT 'MOI',

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_phieu_nhap_kho
        FOREIGN KEY(kho_id)
        REFERENCES dm_kho(id),

    CONSTRAINT fk_phieu_nhap_nhan_vien
        FOREIGN KEY(nhan_vien_id)
        REFERENCES dm_nhan_vien(id)

);
CREATE TRIGGER trg_nv_phieu_nhap_updated_at
BEFORE UPDATE
ON nv_phieu_nhap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE ct_phieu_nhap
(

    id                      SERIAL PRIMARY KEY,

    phieu_nhap_id           INT NOT NULL,

    thuc_pham_id            INT NOT NULL,

    so_luong_nhap           NUMERIC(18,3) NOT NULL,

    don_gia                 NUMERIC(18,2) NOT NULL,

    thanh_tien              NUMERIC(18,2) NOT NULL,

    han_su_dung             DATE,

    so_lo                   VARCHAR(100),

    ghi_chu                 TEXT,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ct_pn
        FOREIGN KEY(phieu_nhap_id)
        REFERENCES nv_phieu_nhap(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ct_pn_tp
        FOREIGN KEY(thuc_pham_id)
        REFERENCES dm_thuc_pham(id)

);
CREATE TRIGGER trg_ct_phieu_nhap_updated_at
BEFORE UPDATE
ON ct_phieu_nhap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE nv_phieu_xuat
(

    id                      SERIAL PRIMARY KEY,

    ma_phieu_xuat           VARCHAR(50) NOT NULL UNIQUE,

    kho_id                  INT NOT NULL,

    nhan_vien_id            INT NOT NULL,

    ngay_xuat               TIMESTAMP NOT NULL,

    tong_so_mat_hang        INT NOT NULL DEFAULT 0,

    tong_so_luong           NUMERIC(18,3) NOT NULL DEFAULT 0,

    ly_do_xuat              VARCHAR(100),

    nguoi_nhan              VARCHAR(255),

    ghi_chu                 TEXT,

    trang_thai              VARCHAR(30) NOT NULL DEFAULT 'MOI',

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_px_kho
        FOREIGN KEY(kho_id)
        REFERENCES dm_kho(id),

    CONSTRAINT fk_px_nv
        FOREIGN KEY(nhan_vien_id)
        REFERENCES dm_nhan_vien(id)

);
CREATE TRIGGER trg_nv_phieu_xuat_updated_at
BEFORE UPDATE
ON nv_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_phieu_xuat_updated_at
BEFORE UPDATE
ON ct_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_phieu_xuat_updated_at
BEFORE UPDATE
ON ct_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE ton_kho
(

    id                          SERIAL PRIMARY KEY,

    kho_id                      INT NOT NULL,

    thuc_pham_id                INT NOT NULL,

    so_luong_ton_so_cap         NUMERIC(18,3) NOT NULL DEFAULT 0,

    so_luong_ton_su_dung        NUMERIC(18,3) NOT NULL DEFAULT 0,

    gia_von_trung_binh          NUMERIC(18,2) NOT NULL DEFAULT 0,

    gia_tri_ton                 NUMERIC(18,2) NOT NULL DEFAULT 0,

    ngay_cap_nhat               TIMESTAMP NOT NULL DEFAULT NOW(),

    active                      BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ton_kho
        FOREIGN KEY(kho_id)
        REFERENCES dm_kho(id),

    CONSTRAINT fk_ton_tp
        FOREIGN KEY(thuc_pham_id)
        REFERENCES dm_thuc_pham(id),

    CONSTRAINT uq_ton_kho
        UNIQUE(kho_id, thuc_pham_id)

);
CREATE TRIGGER trg_ton_kho_updated_at
BEFORE UPDATE
ON ton_kho
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ton_kho_updated_at
BEFORE UPDATE
ON ton_kho
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE ct_phieu_nhap
ADD COLUMN don_vi_so_cap_id INT,
ADD COLUMN he_so_quy_doi NUMERIC(18,3);
ALTER TABLE ct_phieu_nhap
ADD CONSTRAINT fk_ct_pn_don_vi_so_cap
FOREIGN KEY (don_vi_so_cap_id)
REFERENCES dm_don_vi_tinh(id);
ALTER TABLE ct_phieu_xuat
ADD COLUMN don_vi_so_cap_id INT,
ADD COLUMN he_so_quy_doi NUMERIC(18,3);
CREATE TABLE nv_phieu_xuat
(

    id                      SERIAL PRIMARY KEY,

    ma_phieu_xuat           VARCHAR(50) NOT NULL UNIQUE,

    kho_id                  INT NOT NULL,

    nhan_vien_id            INT NOT NULL,

    ngay_xuat               TIMESTAMP NOT NULL,

    tong_so_mat_hang        INT NOT NULL DEFAULT 0,

    tong_so_luong           NUMERIC(18,3) NOT NULL DEFAULT 0,

    ly_do_xuat              VARCHAR(100),

    nguoi_nhan              VARCHAR(255),

    ghi_chu                 TEXT,

    trang_thai              VARCHAR(30) NOT NULL DEFAULT 'MOI',

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_px_kho
        FOREIGN KEY(kho_id)
        REFERENCES dm_kho(id),

    CONSTRAINT fk_px_nv
        FOREIGN KEY(nhan_vien_id)
        REFERENCES dm_nhan_vien(id)

);
CREATE TABLE ct_phieu_xuat
(

    id                      SERIAL PRIMARY KEY,

    phieu_xuat_id           INT NOT NULL,

    thuc_pham_id            INT NOT NULL,

    so_luong_xuat           NUMERIC(18,3) NOT NULL,

    ghi_chu                 TEXT,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ct_px
        FOREIGN KEY(phieu_xuat_id)
        REFERENCES nv_phieu_xuat(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ct_px_tp
        FOREIGN KEY(thuc_pham_id)
        REFERENCES dm_thuc_pham(id)

);
CREATE TRIGGER trg_ct_phieu_xuat_updated_at
BEFORE UPDATE
ON ct_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE ct_phieu_xuat
ADD COLUMN don_vi_so_cap_id INT,
ADD COLUMN he_so_quy_doi NUMERIC(18,3);
ALTER TABLE ct_phieu_xuat
ADD CONSTRAINT fk_ct_px_don_vi_so_cap
FOREIGN KEY (don_vi_so_cap_id)
REFERENCES dm_don_vi_tinh(id);
CREATE TABLE dm_thiet_lap
(

    id                  SERIAL PRIMARY KEY,

    ma_thiet_lap        VARCHAR(100) NOT NULL UNIQUE,

    ten_thiet_lap       VARCHAR(255) NOT NULL,

    gia_tri             TEXT,

    nhom                VARCHAR(100),

    mo_ta               TEXT,

    co_so_id            INT,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_thiet_lap_co_so
        FOREIGN KEY (co_so_id)
        REFERENCES dm_co_so(id)

);
CREATE TRIGGER trg_dm_thiet_lap_updated_at
BEFORE UPDATE
ON dm_thiet_lap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE dm_nha_an
ADD COLUMN co_so_id INT;
ALTER TABLE dm_tai_khoan
ADD COLUMN doi_mat_khau_lan_dau BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE ton_kho
ADD COLUMN last_phieu_nhap_id INT;
ALTER TABLE ton_kho
ADD COLUMN last_phieu_xuat_id INT;
ALTER TABLE ton_kho
ADD CONSTRAINT fk_ton_kho_last_pn
FOREIGN KEY (last_phieu_nhap_id)
REFERENCES nv_phieu_nhap(id);
ALTER TABLE ton_kho
ADD CONSTRAINT fk_ton_kho_last_px
FOREIGN KEY (last_phieu_xuat_id)
REFERENCES nv_phieu_xuat(id);
ALTER TABLE dm_nhan_vien
ADD COLUMN ma_qr VARCHAR(255);
ALTER TABLE dm_nhan_vien
ADD COLUMN ma_barcode VARCHAR(255);
ALTER TABLE dm_nhan_vien
ADD CONSTRAINT uq_dm_nhan_vien_ma_qr
UNIQUE (ma_qr);
ALTER TABLE dm_nhan_vien
ADD CONSTRAINT uq_dm_nhan_vien_ma_barcode
UNIQUE (ma_barcode);
ALTER TABLE dm_mon_an
ADD COLUMN gia_du_kien NUMERIC(18,2) NOT NULL DEFAULT 0;
TRUNCATE TABLE dm_co_so RESTART IDENTITY CASCADE;
ALTER TABLE dm_co_so
ADD COLUMN logo VARCHAR(500);

ALTER TABLE dm_co_so
ADD COLUMN favicon VARCHAR(500);
\l
\c kitchenflow
\d dm_nhan_vien
SELECT
    tk.id,
    tk.ten_dang_nhap,
    tk.mat_khau_hash,
    tk.active,
    tk.doi_mat_khau_lan_dau,
    tk.so_lan_dang_nhap_sai,

    nv.id AS nhan_vien_id,
    nv.ma_nhan_vien,
    nv.ho_ten,

    ARRAY_AGG(DISTINCT vt.ma_vai_tro) AS vai_tros

FROM dm_tai_khoan tk

INNER JOIN dm_nhan_vien nv
    ON nv.id = tk.nhan_vien_id

LEFT JOIN dm_nhan_vien_vai_tro nvt
    ON nvt.nhan_vien_id = nv.id
    AND nvt.active = TRUE

LEFT JOIN dm_vai_tro vt
    ON vt.id = nvt.vai_tro_id
    AND vt.active = TRUE

WHERE tk.ten_dang_nhap = $1

GROUP BY
    tk.id,
    nv.id;
\q
\c ketcehnflow
\c ketchenflow
\l
\c kitchenflow
SELECT * FROM dm_nhan_vien;
select * from dm_thiet_lap
SELECT * FROM dm_nhan_vien;;
select * from dm_thiet_lap;
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'dm_tai_khoan';
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'nv_refresh_token';
ALTER TABLE nv_refresh_token
RENAME COLUMN nhan_vien_id
TO tai_khoan_id;
ALTER TABLE nv_refresh_token
ADD CONSTRAINT fk_refresh_token_tai_khoan
FOREIGN KEY (tai_khoan_id)
REFERENCES dm_tai_khoan(id);
\d dm_thiet_lap
select * from dm_thiet_lap
\r
SELECT
    ten_dang_nhap,
    active,
    so_lan_dang_nhap_sai,
    khoa_den
FROM dm_tai_khoan
WHERE ten_dang_nhap = 'admin';
DELETE FROM nv_refresh_token;
DELETE FROM dm_tai_khoan;
SELECT * FROM dm_tai_khoan;
SELECT * FROM dm_tai_khoan;
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'nv_refresh_token';
\d nv_refresh_token
SELECT
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'nv_refresh_token'::regclass;
kitchenflow=# SELECT
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'nv_refresh_token'::regclass;
                conname                 |                           pg_get_constraintdef                           
----------------------------------------+--------------------------------------------------------------------------
 nv_refresh_token_id_not_null           | NOT NULL id
 nv_refresh_token_token_not_null        | NOT NULL token
 nv_refresh_token_nhan_vien_id_not_null | NOT NULL tai_khoan_id
 nv_refresh_token_expires_at_not_null   | NOT NULL expires_at
 nv_refresh_token_pkey                  | PRIMARY KEY (id)
 nv_refresh_token_token_key             | UNIQUE (token)
 fk_refresh_token_nhan_vien             | FOREIGN KEY (tai_khoan_id) REFERENCES dm_nhan_vien(id) ON DELETE CASCADE
 fk_refresh_token_tai_khoan             | FOREIGN KEY (tai_khoan_id) REFERENCES dm_tai_khoan(id)
(8 rows)

kitchenflow=# ALTER TABLE nv_refresh_token
DROP CONSTRAINT fk_refresh_token_nhan_vien;
ALTER TABLE nv_refresh_token
DROP CONSTRAINT fk_refresh_token_nhan_vien;
SELECT
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'nv_refresh_token'::regclass;
ALTER TABLE nv_refresh_token
RENAME CONSTRAINT
nv_refresh_token_nhan_vien_id_not_null
TO
nv_refresh_token_tai_khoan_id_not_null;
SELECT
    id,
    ten_dang_nhap
FROM dm_tai_khoan;
SELECT
    id,
    tai_khoan_id,
    token,
    revoked
FROM nv_refresh_token;
SELECT
    token,
    revoked
FROM nv_refresh_token;
select * from dm_nhan_vien
\d dm_nhan_vien
SELECT * FROM dm_nhan_vien
\r
SELECT * FROM dm_nhan_vien
\r
SELECT * FROM dm_nhan_vien;
\d dm_nhan_vien
SELECT * FROM dm_nhan_vien;
SELECT * FROM dm_nhan_vien;
SELECT * FROM dm_nhan_vien;
SELECT * FROM dm_nhan_vien;
CREATE TABLE dm_tinh_thanh (

    id SERIAL PRIMARY KEY,

    ma_tinh_thanh VARCHAR(20) NOT NULL UNIQUE,

    ten_tinh_thanh VARCHAR(255) NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);
CREATE TABLE dm_xa_phuong (

    id SERIAL PRIMARY KEY,

    ma_xa_phuong VARCHAR(30) NOT NULL UNIQUE,

    ten_xa_phuong VARCHAR(255) NOT NULL,

    tinh_thanh_id INT NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_xa_phuong_tinh_thanh
        FOREIGN KEY (tinh_thanh_id)
        REFERENCES dm_tinh_thanh(id)

);
ALTER TABLE dm_nhan_vien
ADD COLUMN tinh_thanh_id INT,
ADD COLUMN xa_phuong_id INT;
ALTER TABLE dm_nhan_vien
ADD CONSTRAINT fk_nv_tinh_thanh
FOREIGN KEY (tinh_thanh_id)
REFERENCES dm_tinh_thanh(id);

ALTER TABLE dm_nhan_vien
ADD CONSTRAINT fk_nv_xa_phuong
FOREIGN KEY (xa_phuong_id)
REFERENCES dm_xa_phuong(id);
CREATE TABLE dm_quoc_gia (

    id SERIAL PRIMARY KEY,

    ma_quoc_gia VARCHAR(10) NOT NULL UNIQUE,

    ten_quoc_gia VARCHAR(255) NOT NULL,

    ten_tieng_anh VARCHAR(255),

    ma_dien_thoai VARCHAR(10),

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);
CREATE TABLE dm_tinh_thanh (

    id SERIAL PRIMARY KEY,

    ma_tinh_thanh VARCHAR(20) NOT NULL UNIQUE,

    ten_tinh_thanh VARCHAR(255) NOT NULL,

    quoc_gia_id INT NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_tinh_thanh_quoc_gia
        FOREIGN KEY (quoc_gia_id)
        REFERENCES dm_quoc_gia(id)

);
ALTER TABLE dm_tinh_thanh
ADD COLUMN quoc_gia_id INT;
ALTER TABLE dm_tinh_thanh
ADD CONSTRAINT fk_tinh_thanh_quoc_gia
FOREIGN KEY (quoc_gia_id)
REFERENCES dm_quoc_gia(id);
ALTER TABLE dm_nhan_vien
ADD COLUMN quoc_gia_id INT;
ALTER TABLE dm_nhan_vien
ADD CONSTRAINT fk_nv_quoc_gia
FOREIGN KEY (quoc_gia_id)
REFERENCES dm_quoc_gia(id);
ALTER TABLE dm_quoc_gia
ADD COLUMN ten_viet_tat VARCHAR(50);
ALTER TABLE dm_tinh_thanh
ADD COLUMN ten_viet_tat VARCHAR(100);
ALTER TABLE dm_xa_phuong
ADD COLUMN ten_viet_tat VARCHAR(100);
\q dm_quoc_gia
\l
\c kitchenflow
\d dm_quoc_gia
ALTER TABLE "dm_quoc_gia"
ADD COLUMN "ma_iso2" VARCHAR(2),
ADD COLUMN "ma_iso3" VARCHAR(3);
\d
ALTER TABLE nv_chinh_sach_ho_tro
ALTER COLUMN doi_tuong_ap_dung DROP NOT NULL;
CREATE TABLE nv_chinh_sach_vai_tro (

    id SERIAL PRIMARY KEY,

    vai_tro_id INT NOT NULL,

    chinh_sach_id INT NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_cs_vai_tro_vai_tro
        FOREIGN KEY(vai_tro_id)
        REFERENCES dm_vai_tro(id),


    CONSTRAINT fk_cs_vai_tro_chinh_sach
        FOREIGN KEY(chinh_sach_id)
        REFERENCES nv_chinh_sach_ho_tro(id),


    CONSTRAINT uq_cs_vai_tro
        UNIQUE(vai_tro_id, chinh_sach_id)

);
CREATE TABLE nv_chinh_sach_nhan_vien (

    id SERIAL PRIMARY KEY,


    nhan_vien_id INT NOT NULL,


    chinh_sach_id INT NOT NULL,


    active BOOLEAN DEFAULT TRUE,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_cs_nv_nhan_vien
        FOREIGN KEY(nhan_vien_id)
        REFERENCES dm_nhan_vien(id),


    CONSTRAINT fk_cs_nv_chinh_sach
        FOREIGN KEY(chinh_sach_id)
        REFERENCES nv_chinh_sach_ho_tro(id),


    CONSTRAINT uq_cs_nv
        UNIQUE(nhan_vien_id,chinh_sach_id)

);
CREATE TABLE nv_chinh_sach_chuc_vu (

    id SERIAL PRIMARY KEY,


    chuc_vu_id INT NOT NULL,


    chinh_sach_id INT NOT NULL,


    active BOOLEAN DEFAULT TRUE,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_cs_cv_chuc_vu
        FOREIGN KEY(chuc_vu_id)
        REFERENCES dm_chuc_vu(id),


    CONSTRAINT fk_cs_cv_chinh_sach
        FOREIGN KEY(chinh_sach_id)
        REFERENCES nv_chinh_sach_ho_tro(id),


    CONSTRAINT uq_cs_cv
        UNIQUE(chuc_vu_id,chinh_sach_id)

);
CREATE TABLE dm_voucher (

    id SERIAL PRIMARY KEY,


    ma_voucher VARCHAR(50) UNIQUE NOT NULL,


    ten_voucher VARCHAR(255) NOT NULL,


    loai_giam VARCHAR(20) NOT NULL,
    
    /*
        PHAN_TRAM
        SO_TIEN
    */


    gia_tri DECIMAL(18,2) NOT NULL,


    so_luong INT,


    da_su_dung INT DEFAULT 0,


    ngay_bat_dau TIMESTAMP,


    ngay_ket_thuc TIMESTAMP,


    active BOOLEAN DEFAULT TRUE,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
ALTER TABLE dm_quoc_gia
ADD COLUMN ten_quoc_gia_en VARCHAR(255);
\d dm_tinh_thanh
\d dm_xa_phuong
select * from dm_tinh_thanh;
\d dm_tinh_thanh
select * from dm_tinh_thanh
\r
select * from dm_tinh_thanh;
\d dm_nhan_vien
\d dm_co_so
ALTER TABLE dm_co_so
ADD COLUMN quoc_gia_id INTEGER,
ADD COLUMN tinh_thanh_id INTEGER,
ADD COLUMN xa_phuong_id INTEGER;
ALTER TABLE dm_co_so
ADD CONSTRAINT fk_co_so_quoc_gia
FOREIGN KEY (quoc_gia_id)
REFERENCES dm_quoc_gia(id);

ALTER TABLE dm_co_so
ADD CONSTRAINT fk_co_so_tinh_thanh
FOREIGN KEY (tinh_thanh_id)
REFERENCES dm_tinh_thanh(id);

ALTER TABLE dm_co_so
ADD CONSTRAINT fk_co_so_xa_phuong
FOREIGN KEY (xa_phuong_id)
REFERENCES dm_xa_phuong(id);
ALTER TABLE dm_co_so
ADD COLUMN logo_doi_tac VARCHAR(500);
\d dm_tinh_thanh
select * from dm_tinh_thanh;
select * from dm_co_so;
\d dm_nhan_vien;
\d dm_phong_ban
ALTER TABLE dm_phong_ban
ADD COLUMN co_so_id INTEGER;
ALTER TABLE dm_phong_ban
ADD CONSTRAINT fk_dm_phong_ban_co_so
FOREIGN KEY (co_so_id)
REFERENCES dm_co_so(id);
ALTER TABLE dm_phong_ban
ALTER COLUMN co_so_id SET NOT NULL;
UPDATE dm_phong_ban
SET co_so_id = 1
WHERE co_so_id IS NULL;
ALTER TABLE dm_phong_ban
ALTER COLUMN co_so_id SET NOT NULL;
SELECT
    ma_the,
    COUNT(*) AS so_luong
FROM dm_nhan_vien
WHERE ma_the IS NOT NULL
  AND ma_the <> ''
GROUP BY ma_the
HAVING COUNT(*) > 1;
SELECT
    ma_the,
    COUNT(*) AS so_luong
FROM dm_nhan_vien
WHERE ma_the IS NOT NULL
  AND ma_the <> ''
GROUP BY ma_the
HAVING COUNT(*) > 1;
ALTER TABLE dm_nhan_vien
ADD CONSTRAINT uq_dm_nhan_vien_ma_the
UNIQUE (ma_the);
\d dm_phong_ban
\d dm_chuc_vu
\d dm_quoc_gia
\d dm_chuc_vu
ALTER TABLE dm_quoc_gia
ADD CONSTRAINT chk_dm_quoc_gia_ma_not_empty
CHECK (TRIM(ma_quoc_gia) <> '');

ALTER TABLE dm_quoc_gia
ADD CONSTRAINT chk_dm_quoc_gia_ten_not_empty
CHECK (TRIM(ten_quoc_gia) <> '');

ALTER TABLE dm_quoc_gia
ADD CONSTRAINT chk_dm_quoc_gia_iso2_not_empty
CHECK (TRIM(ma_iso2) <> '');

ALTER TABLE dm_quoc_gia
ADD CONSTRAINT chk_dm_quoc_gia_iso3_not_empty
CHECK (TRIM(ma_iso3) <> '');
ALTER TABLE dm_quoc_gia
ADD CONSTRAINT chk_dm_quoc_gia_iso2_not_empty
CHECK (TRIM(ma_iso2) <> '');
\d dm_tinh_thanh
\dmpb
\s dm_phong_ban
