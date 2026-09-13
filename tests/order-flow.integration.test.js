'use strict';

// Chỉ chạy trên bản sao database dùng riêng cho kiểm thử, KHÔNG chạy trên DB ứng dụng.
// KITCHENFLOW_TEST_DB=kitchenflow_codex_order_test_20260913 node --test tests/order-flow.integration.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
require('dotenv').config({ quiet: true });
const testDatabase = process.env.KITCHENFLOW_TEST_DB;
const enabled = !!testDatabase;
if (enabled && (!/^kitchenflow_codex_order_test_\d{8}$/.test(testDatabase) || testDatabase === process.env.DB_NAME)) {
    throw new Error('Refusing to test against a non-isolated database.');
}
let pool, server, base, buyer, manager, other, coSoId, slotId, productId;
const password = 'Local-order-test-2026!'; // Disposable local test accounts only.
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
    .format(new Date(Date.now() + 86400000));

async function request(path, user, body, method = body ? 'POST' : 'GET', status = 200) {
    const response = await fetch(`${base}/api/mcs/v1${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${user.accessToken}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    const result = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${result.message}`);
    return result.data;
}

async function account(name, roleIds, profile) {
    const employee = await pool.query(`INSERT INTO dm_nhan_vien (ma_nhan_vien, ho_ten, co_so_id, phong_ban_id, so_dien_thoai)
        VALUES ($1,$2,$3,$4,'0900000000') ON CONFLICT (ma_nhan_vien) DO UPDATE SET active=TRUE RETURNING id`,
    [name, `Kiểm thử ${name}`, coSoId, profile.phong_ban_id]);
    const result = await pool.query(`INSERT INTO dm_tai_khoan (nhan_vien_id,ten_dang_nhap,mat_khau_hash,doi_mat_khau_lan_dau)
        VALUES ($1,$2,$3,FALSE) ON CONFLICT (ten_dang_nhap) DO UPDATE SET mat_khau_hash=EXCLUDED.mat_khau_hash,
        bi_khoa=FALSE,active=TRUE,doi_mat_khau_lan_dau=FALSE RETURNING id`,
    [employee.rows[0].id, name, require('../src/utils/md5').hash(password)]);
    const id = result.rows[0].id;
    for (const roleId of roleIds) await pool.query(`INSERT INTO dm_tai_khoan_vai_tro (tai_khoan_id,vai_tro_id)
        VALUES ($1,$2) ON CONFLICT (tai_khoan_id,vai_tro_id) DO UPDATE SET active=TRUE`, [id, roleId]);
    return request('/auth/login', null, { taiKhoan: name, matKhau: password });
}

before(async () => {
    if (!enabled) return;
    process.env.DB_NAME = testDatabase;
    pool = require('../src/config/database');
    assert.equal((await pool.query('SELECT current_database() AS name')).rows[0].name, testDatabase);
    const profile = (await pool.query('SELECT co_so_id,phong_ban_id FROM dm_nhan_vien WHERE active=TRUE AND co_so_id IS NOT NULL ORDER BY id LIMIT 1')).rows[0];
    coSoId = profile.co_so_id;
    const roles = [];
    for (const code of ['CODEX_TEST_KITCHEN_A', 'CODEX_TEST_KITCHEN_B', 'CODEX_TEST_BUYER']) {
        const result = await pool.query(`INSERT INTO dm_vai_tro (ma_vai_tro,ten_vai_tro) VALUES ($1,$1)
            ON CONFLICT (ma_vai_tro) DO UPDATE SET active=TRUE RETURNING id`, [code]);
        const id = result.rows[0].id;
        roles.push(id);
        await pool.query(`INSERT INTO dm_vai_tro_quyen (vai_tro_id,quyen_id)
            SELECT $1,id FROM dm_quyen WHERE active=TRUE AND ($2::boolean OR ma_quyen NOT IN ('Q002031','Q002032','Q002033'))
            ON CONFLICT (vai_tro_id,quyen_id) DO UPDATE SET active=TRUE`, [id, code !== 'CODEX_TEST_BUYER']);
    }
    const settingId = (await pool.query(`INSERT INTO dm_thiet_lap (ma_thiet_lap,ten_thiet_lap)
        VALUES ('VAI_TRO_NHAN_VIEN_NHAN_MON','Kiểm thử vai trò nhận đơn')
        ON CONFLICT (ma_thiet_lap) DO UPDATE SET active=TRUE RETURNING id`)).rows[0].id;
    await pool.query('UPDATE dm_thiet_lap_gia_tri SET active=FALSE WHERE thiet_lap_id=$1', [settingId]);
    await pool.query(`INSERT INTO dm_thiet_lap_gia_tri (thiet_lap_id,gia_tri)
        VALUES ($1,'CODEX_TEST_KITCHEN_A, codex_test_kitchen_b, CODEX_TEST_KITCHEN_A')`, [settingId]);
    slotId = (await pool.query(`INSERT INTO dm_khung_gio_nhan_hang (ma_khung_gio,ten_khung_gio,co_so_id,gio_bat_dau,gio_ket_thuc)
        VALUES ('CODEX_TEST_SLOT','Khung giờ kiểm thử',$1,'12:00','13:00')
        ON CONFLICT (co_so_id,ma_khung_gio) DO UPDATE SET active=TRUE RETURNING id`, [coSoId])).rows[0].id;
    const groupId = (await pool.query(`INSERT INTO dm_nhom_san_pham (ma_nhom_san_pham,ten_nhom_san_pham,loai_san_pham)
        VALUES ('CODEX_TEST_GROUP','Kiểm thử đặt hàng',10) ON CONFLICT (ma_nhom_san_pham) DO UPDATE SET active=TRUE RETURNING id`)).rows[0].id;
    productId = (await pool.query(`INSERT INTO dm_san_pham (ma_san_pham,ten_san_pham,nhom_san_pham_id,gia_ban)
        VALUES ('CODEX_TEST_FOOD','Món kiểm thử - không giao thật',$1,10000)
        ON CONFLICT (ma_san_pham) DO UPDATE SET active=TRUE RETURNING id`, [groupId])).rows[0].id;
    server = require('../src/app').listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
    buyer = await account('codex_order_buyer', [roles[2]], profile);
    manager = await account('codex_order_manager', [roles[0], roles[1]], profile);
    other = await account('codex_order_kitchen_b', [roles[1]], profile);
});

after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
});

function payload(method = 40) {
    return { clientRequestId: randomUUID(), coSoId, datHo: false, tenNguoiNhan: 'Khách kiểm thử',
        soDienThoaiNguoiNhan: '0900000000', diaChiNhan: 'Địa chỉ kiểm thử - không giao thật',
        khungGioNhanId: Number(slotId), thoiGianNhanTu: `${day}T12:00:00+07:00`, thoiGianNhanDen: `${day}T13:00:00+07:00`,
        phuongThucThanhToan: method, items: [{ sanPhamId: Number(productId), soLuong: 1 }] };
}
const create = data => request('/nv-don-hang/tao-moi', buyer, data, 'POST', 201);
const detail = id => request(`/nv-don-hang/${id}`, buyer);
const action = (order, name, status = 200) => request(`/nv-don-hang/${order.id}/${name}`, manager, { version: order.version }, 'PATCH', status);

test('Order/payment/notification integration on an isolated PostgreSQL database', { skip: !enabled }, async t => {
    await t.test('all eight order pages render the shared shell and load their local assets', async () => {
        const routes = require('../src/routes/web/config').filter(route => route.path.startsWith('/dat-hang/'));
        assert.equal(routes.length, 8);
        const assets = new Set();
        for (const route of routes) {
            const url = route.path.replace(/:[A-Za-z]+/g, String(buyer.id));
            const response = await fetch(`${base}${url}`);
            assert.equal(response.status, 200, url);
            const html = await response.text();
            assert.match(html, /id="appHeader"/);
            assert.match(html, /id="appSidebar"/);
            assert.match(html, /id="appFooter"/);
            assert.match(html, /data-order-page=/);
            for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(\/assets\/[^\"]+)"/g)) assets.add(match[1]);
        }
        for (const path of assets) {
            const response = await fetch(`${base}${path}`);
            assert.equal(response.status, 200, path);
            await response.text();
        }
    });

    await t.test('23:50 rolls checkout to the next date; seconds, timezones and capacity stay correct', async () => {
        const slots = require('../src/modules/danh-muc/dat-hang/khung-gio-nhan-hang/khung-gio-nhan-hang.service');
        const settings = require('../src/modules/cau-hinh/cau-hinh.service');
        const oldClock = slots.getThoiGianHienTai;
        const oldLead = settings.getSoPhutDatHangTruoc;
        slots.getThoiGianHienTai = () => new Date('2026-12-31T23:50:30+07:00');
        settings.getSoPhutDatHangTruoc = async () => 20;
        let midnightSlot;
        try {
            for (const [code, start, end] of [['CODEX_MIDNIGHT_EARLY','00:10','00:14'],['CODEX_MIDNIGHT_OK','00:15','00:30']]) {
                const row = await pool.query(`INSERT INTO dm_khung_gio_nhan_hang
                    (co_so_id,ma_khung_gio,ten_khung_gio,gio_bat_dau,gio_ket_thuc,so_don_toi_da)
                    VALUES ($1,$2,$2,$3,$4,NULL) ON CONFLICT (co_so_id,ma_khung_gio)
                    DO UPDATE SET active=TRUE,so_don_toi_da=NULL RETURNING id`, [coSoId,code,start,end]);
                if (code === 'CODEX_MIDNIGHT_OK') midnightSlot = row.rows[0].id;
            }
            const checkout = await request('/dat-hang/catalog/thong-tin-checkout?ngayNhan=2026-12-31', buyer);
            assert.equal(checkout.ngayNhan, '2027-01-01');
            assert.equal(checkout.ngayNhanDaDieuChinh, true);
            assert.equal(checkout.thoiGianNhanSomNhat, '2027-01-01T00:10:30.000+07:00');
            assert.ok(!checkout.khungGioNhanHang.some(row => row.maKhungGio === 'CODEX_MIDNIGHT_EARLY'));
            for (const row of checkout.khungGioNhanHang) {
                assert.ok(new Date(row.thoiGianNhanDen) > new Date(row.thoiGianNhanTu), `Invalid range: ${row.maKhungGio}`);
            }
            const finalSlot = checkout.khungGioNhanHang.find(row => row.gioBatDau === '23:45:00' && row.gioKetThuc === '00:00:00');
            if (finalSlot) {
                assert.equal(new Date(finalSlot.thoiGianNhanDen).toISOString(), '2027-01-01T17:00:00.000Z');
                await slots.validateDuLieu(finalSlot, finalSlot.id);
                const finalOrder = await create({ ...payload(), khungGioNhanId: Number(finalSlot.id),
                    thoiGianNhanTu: finalSlot.thoiGianNhanTu, thoiGianNhanDen: finalSlot.thoiGianNhanDen });
                assert.equal(new Date(finalOrder.khungGioNhan.den).toISOString(), '2027-01-01T17:00:00.000Z');
            }
            const slot = checkout.khungGioNhanHang.find(row => row.maKhungGio === 'CODEX_MIDNIGHT_OK');
            assert.ok(slot);
            assert.equal(new Date(slot.thoiGianNhanTu).toISOString(), '2026-12-31T17:15:00.000Z');
            const data = { ...payload(), khungGioNhanId: Number(slot.id),
                thoiGianNhanTu: slot.thoiGianNhanTu, thoiGianNhanDen: slot.thoiGianNhanDen };
            const order = await create(data);
            assert.equal(new Date(order.khungGioNhan.tu).toISOString(), '2026-12-31T17:15:00.000Z');
            const saved = (await pool.query("SELECT to_char(thoi_gian_nhan_tu,'YYYY-MM-DD HH24:MI:SS') AS local FROM nv_don_hang WHERE id=$1", [order.id])).rows[0];
            assert.equal(saved.local, '2027-01-01 00:15:00');
            const used = (await pool.query('SELECT COUNT(*)::integer AS n FROM nv_don_hang WHERE khung_gio_nhan_id=$1 AND thoi_gian_nhan_tu::date=$2 AND trang_thai>0', [slot.id,'2027-01-01'])).rows[0].n;
            await pool.query('UPDATE dm_khung_gio_nhan_hang SET so_don_toi_da=$2 WHERE id=$1', [slot.id,used]);
            await request('/nv-don-hang/tao-moi', buyer, { ...data, clientRequestId: randomUUID() }, 'POST', 409);
            const future = await request('/dat-hang/catalog/thong-tin-checkout?ngayNhan=2027-01-02', buyer);
            assert.equal(future.ngayNhan, '2027-01-02');
            assert.equal(future.ngayNhanDaDieuChinh, false);
            await request('/dat-hang/catalog/thong-tin-checkout?ngayNhan=2026-02-30', buyer, undefined, 'GET', 400);
            slots.getThoiGianHienTai = () => new Date('2027-01-01T00:00:01+07:00');
            const rollover = await request('/dat-hang/catalog/thong-tin-checkout?ngayNhan=2026-12-31', buyer);
            assert.equal(rollover.ngayNhan, '2027-01-01');
            assert.equal(rollover.thoiGianNhanSomNhat, '2027-01-01T00:20:01.000+07:00');
        } finally {
            slots.getThoiGianHienTai = oldClock;
            settings.getSoPhutDatHangTruoc = oldLead;
            if (midnightSlot) await pool.query('UPDATE dm_khung_gio_nhan_hang SET so_don_toi_da=NULL WHERE id=$1', [midnightSlot]);
        }
    });

    await t.test('concurrent retry creates one order, one kitchen alert, and only configured role recipients', async () => {
        const data = payload();
        const [a, b] = await Promise.all([create(data), create(data)]);
        assert.equal(a.id, b.id);
        assert.equal(a.diaDiemNhan.tenDiaDiem, 'Địa điểm nhận khác');
        const rows = (await pool.query(`SELECT tb.id,nn.tai_khoan_id FROM nv_thong_bao tb
            JOIN ct_thong_bao_nguoi_nhan nn ON nn.thong_bao_id=tb.id
            WHERE tb.tham_chieu_id=$1 AND tb.ma_su_kien='DON_HANG_MOI_NHA_AN'`, [a.id])).rows;
        assert.equal(new Set(rows.map(row => row.id)).size, 1);
        assert.deepEqual(rows.map(row => row.tai_khoan_id).sort((x,y)=>x-y), [manager.id,other.id].sort((x,y)=>x-y));
    });

    await t.test('two concurrent orders cannot both take the last available place', async () => {
        const used = (await pool.query(`SELECT COUNT(*)::integer AS n FROM nv_don_hang
            WHERE khung_gio_nhan_id=$1 AND thoi_gian_nhan_tu::date=$2 AND trang_thai>0`, [slotId,day])).rows[0].n;
        await pool.query('UPDATE dm_khung_gio_nhan_hang SET so_don_toi_da=$2 WHERE id=$1', [slotId,used+1]);
        try {
            const results = await Promise.all([payload(),payload()].map(async body => {
                const response = await fetch(`${base}/api/mcs/v1/nv-don-hang/tao-moi`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.accessToken}` },
                    body: JSON.stringify(body)
                });
                await response.json();
                return response.status;
            }));
            assert.deepEqual(results.sort(), [201,409]);
            const count = (await pool.query(`SELECT COUNT(*)::integer AS n FROM nv_don_hang
                WHERE khung_gio_nhan_id=$1 AND thoi_gian_nhan_tu::date=$2 AND trang_thai>0`, [slotId,day])).rows[0].n;
            assert.equal(count, used+1);
        } finally {
            await pool.query('UPDATE dm_khung_gio_nhan_hang SET so_don_toi_da=NULL WHERE id=$1', [slotId]);
        }
    });

    await t.test('QR requires paid status; pending QR is reused; expiry/retry and permissions are enforced', async () => {
        let order = await create(payload());
        await action(order, 'xac-nhan', 409);
        const init = () => request(`/nv-thanh-toan-don-hang/${order.id}/khoi-tao`, buyer, {}, 'POST', 201);
        const payment = await init();
        const duplicate = await init();
        assert.equal(payment.id, duplicate.id);
        assert.match(payment.qr_payload, /^data:image\/png;base64,/);
        assert.equal((await detail(order.id)).trangThaiThanhToan, 20);
        const confirm = (txn, user, status=200) => request(`/nv-thanh-toan-don-hang/giao-dich/${txn.id}/xac-nhan`, user,
            { maGiaoDich: txn.ma_giao_dich || txn.maGiaoDich }, 'PATCH', status);
        await confirm(payment, buyer, 403);
        await pool.query("UPDATE nv_thanh_toan_don_hang SET qr_het_han_luc=NOW()-INTERVAL '1 minute' WHERE id=$1", [payment.id]);
        await confirm(payment, manager, 409);
        const fresh = await init();
        assert.notEqual(fresh.id, payment.id);
        await confirm(fresh, manager);
        await confirm(fresh, manager, 409);
        order = await detail(order.id);
        assert.equal(order.trangThaiThanhToan, 30);
        for (const name of ['xac-nhan', 'san-sang-giao', 'bat-dau-giao', 'hoan-thanh']) {
            order = await action(order, name);
            const progress = (await pool.query(`SELECT id,tieu_de FROM nv_thong_bao WHERE tham_chieu_id=$1
                AND ma_su_kien='DON_HANG_TIEN_TRINH' AND trang_thai=20`, [order.id])).rows;
            assert.equal(progress.length, 1);
            const recipients = (await pool.query('SELECT tai_khoan_id FROM ct_thong_bao_nguoi_nhan WHERE thong_bao_id=$1', [progress[0].id])).rows;
            assert.deepEqual(recipients.map(row => row.tai_khoan_id), [buyer.id]);
        }
        assert.equal(order.trangThai, 60);
        assert.equal(order.payments.filter(row => row.trangThai===30).length, 1);
        assert.equal(order.payments.find(row => row.trangThai===30).nguoiThuTienTaiKhoanId, null);
        const notifications = (await pool.query(`SELECT ma_su_kien,trang_thai,tieu_de FROM nv_thong_bao WHERE tham_chieu_id=$1`, [order.id])).rows;
        assert.equal(notifications.filter(row => row.ma_su_kien==='DON_HANG_TIEN_TRINH' && row.trang_thai===30).length, 3);
        assert.ok(notifications.some(row => row.trang_thai===20 && row.tieu_de==='Đơn hàng đã hoàn thành'));
        assert.ok(notifications.some(row => row.trang_thai===20 && row.ma_su_kien==='DON_HANG_MOI_NHA_AN'));
    });

    for (const method of [10,20,30]) await t.test(`method ${method}: completion records paid + collector atomically, without double collection`, async () => {
        let order = await create(payload(method));
        order = await action(order, 'xac-nhan');
        order = await action(order, 'san-sang-giao');
        const stale = { ...order };
        order = await action(order, 'hoan-thanh');
        assert.equal(order.trangThai, 60);
        assert.equal(order.trangThaiThanhToan, 30);
        assert.equal(order.payments.length, 1);
        assert.equal(order.payments[0].nguoiThuTienTaiKhoanId, manager.id);
        await action(stale, 'hoan-thanh', 409);
        assert.equal((await detail(order.id)).payments.length, 1);
    });

    await t.test('a notification failure rolls back completion AND payment, retry succeeds', async () => {
        let order = await create(payload(20));
        order = await action(order, 'xac-nhan');
        order = await action(order, 'san-sang-giao');
        const notifications = require('../src/modules/nghiep-vu/dat-hang/thong-bao/thong-bao-don-hang.service');
        const original = notifications.sendProgress;
        notifications.sendProgress = async () => { throw new Error('Intentional test failure after payment'); };
        try { await action(order, 'hoan-thanh', 500); } finally { notifications.sendProgress = original; }
        const unchanged = await detail(order.id);
        assert.equal(unchanged.version, order.version);
        assert.equal(unchanged.trangThai, 40);
        assert.equal(unchanged.trangThaiThanhToan, 10);
        assert.equal(unchanged.payments.length, 0);
        assert.equal((await action(order, 'hoan-thanh')).trangThaiThanhToan, 30);
    });
});
