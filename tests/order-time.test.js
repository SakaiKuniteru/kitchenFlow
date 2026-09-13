'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/modules/danh-muc/dat-hang/khung-gio-nhan-hang/khung-gio-nhan-hang.service');

for (const [now, minutes, expected] of [
    ['2026-09-12T23:50:00+07:00', 20, '2026-09-13T00:10:00.000+07:00'],
    ['2026-09-12T23:50:59+07:00', 20, '2026-09-13T00:10:59.000+07:00'],
    ['2026-12-31T23:50:00+07:00', 20, '2027-01-01T00:10:00.000+07:00'],
    ['2028-02-28T23:50:00+07:00', 20, '2028-02-29T00:10:00.000+07:00'],
    ['2026-02-28T23:50:00+07:00', 20, '2026-03-01T00:10:00.000+07:00'],
    ['2026-09-12T23:59:59+07:00', 0, '2026-09-12T23:59:59.000+07:00'],
    ['2026-09-12T23:50:00+07:00', 1440, '2026-09-13T23:50:00.000+07:00'],
    ['2026-09-12T16:50:00Z', 20, '2026-09-13T00:10:00.000+07:00']
]) test(`${now} + ${minutes} minutes rolls the full Vietnam date/time correctly`, () => {
    const result = service.tinhMocNhanSomNhat(minutes, new Date(now));
    assert.equal(result.thoiGianNhanSomNhat, expected);
    assert.equal(result.ngayNhanSomNhat, expected.slice(0, 10));
});

test('date validation rejects invalid calendar days instead of silently rolling them', () => {
    for (const date of ['2026-02-30', '2026-02-29', '2026-13-01', '2026-04-31', '12/09/2026']) {
        assert.throws(() => service.parseNgayNhan(date));
    }
    assert.equal(service.parseNgayNhan('2028-02-29'), '2028-02-29');
});

test('order code uses Vietnam calendar date, not the previous UTC day after midnight', () => {
    const { generateOrderCode } = require('../src/modules/nghiep-vu/dat-hang/don-hang/don-hang-code.service');
    assert.match(generateOrderCode(new Date('2026-09-13T00:10:00+07:00')), /^DH20260913[A-F0-9]{8}$/);
});
