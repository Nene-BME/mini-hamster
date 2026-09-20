'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  // รายการประวัติการขายทั้งหมด
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // โหลดข้อมูลตอนเปิดหน้า
  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false }); // ล่าสุดไปเก่าสุด

    if (error) {
      setErrorMsg('โหลดประวัติการขายไม่สำเร็จ: ' + error.message);
    } else {
      setSales(data);
      setErrorMsg('');
    }
    setLoading(false);
  }

  // คำนวณยอดขายรวมทั้งหมดจากทุกแถว
  const totalSales = sales.reduce(
    (sum, sale) => sum + (Number(sale.total_price) || 0),
    0
  );

  // แปลงวันเวลาให้อ่านง่ายตามรูปแบบไทย
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>ประวัติการขาย</h1>

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* สรุปยอดขายรวมทั้งหมด */}
      <div
        className="card"
        style={{ backgroundColor: '#eef2ff', marginBottom: 20 }}
      >
        <strong style={{ fontSize: 18 }}>
          ยอดขายรวมทั้งหมด: {totalSales.toFixed(2)} บาท
        </strong>
        <div style={{ color: '#555', marginTop: 4 }}>
          จำนวนรายการขายทั้งหมด: {sales.length} รายการ
        </div>
      </div>

      {/* ตารางประวัติการขาย */}
      <div className="card">
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : sales.length === 0 ? (
          <p>ยังไม่มีประวัติการขาย</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>วันเวลาที่ขาย</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDateTime(sale.sold_at)}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity}</td>
                  <td>{Number(sale.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
