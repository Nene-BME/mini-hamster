'use client';

import { supabase } from '@/lib/supabaseClient';
';

export default function HomePage() {
  // รายการสินค้าทั้งหมด
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ฟอร์มเพิ่มสินค้าใหม่
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });

  // แถวที่กำลังแก้ไขแบบ inline (เก็บ id ของแถวนั้น)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // โหลดสินค้าทั้งหมดตอนเปิดหน้า
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('โหลดข้อมูลสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setProducts(data);
      setErrorMsg('');
    }
    setLoading(false);
  }

  // จัดการค่าฟอร์มเพิ่มสินค้าใหม่
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // เพิ่มสินค้าใหม่ลงตาราง products
  async function handleAddProduct(e) {
    e.preventDefault();
    if (!form.sku || !form.name || !form.price) {
      setErrorMsg('กรุณากรอก SKU, ชื่อสินค้า และราคาให้ครบ');
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        sku: form.sku,
        name: form.name,
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock, 10) : 0,
        unit: form.unit,
      },
    ]);

    if (error) {
      setErrorMsg('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }

    // เคลียร์ฟอร์มและโหลดรายการใหม่
    setForm({ sku: '', name: '', price: '', stock: '', unit: '' });
    fetchProducts();
  }

  // ลบสินค้า
  async function handleDelete(id) {
    const confirmDelete = window.confirm('ยืนยันการลบสินค้านี้หรือไม่?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setErrorMsg('ลบสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }
    fetchProducts();
  }

  // เริ่มแก้ไขแถว: เก็บค่าปัจจุบันไว้ใน editForm
  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  // บันทึกการแก้ไขแถว
  async function handleSaveEdit(id) {
    const { error } = await supabase
      .from('products')
      .update({
        sku: editForm.sku,
        name: editForm.name,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        unit: editForm.unit,
      })
      .eq('id', id);

    if (error) {
      setErrorMsg('แก้ไขสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }

    setEditingId(null);
    setEditForm({});
    fetchProducts();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>รายการสินค้า</h1>

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

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <div className="card">
        <h2 style={{ marginBottom: 12, fontSize: 16 }}>เพิ่มสินค้าใหม่</h2>
        <form
          onSubmit={handleAddProduct}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}
        >
          <input
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleFormChange}
            style={{ width: 110 }}
          />
          <input
            name="name"
            placeholder="ชื่อสินค้า"
            value={form.name}
            onChange={handleFormChange}
            style={{ width: 180 }}
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="ราคา"
            value={form.price}
            onChange={handleFormChange}
            style={{ width: 100 }}
          />
          <input
            name="stock"
            type="number"
            placeholder="คงเหลือ"
            value={form.stock}
            onChange={handleFormChange}
            style={{ width: 100 }}
          />
          <input
            name="unit"
            placeholder="หน่วย"
            value={form.unit}
            onChange={handleFormChange}
            style={{ width: 100 }}
          />
          <button type="submit">+ เพิ่มสินค้า</button>
        </form>
      </div>

      {/* ตารางรายการสินค้า */}
      <div className="card">
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : products.length === 0 ? (
          <p>ยังไม่มีสินค้าในระบบ</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หน่วย</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isEditing = editingId === product.id;
                return (
                  <tr key={product.id}>
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            name="sku"
                            value={editForm.sku}
                            onChange={handleEditChange}
                            style={{ width: 90 }}
                          />
                        </td>
                        <td>
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            style={{ width: 150 }}
                          />
                        </td>
                        <td>
                          <input
                            name="price"
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={handleEditChange}
                            style={{ width: 80 }}
                          />
                        </td>
                        <td>
                          <input
                            name="stock"
                            type="number"
                            value={editForm.stock}
                            onChange={handleEditChange}
                            style={{ width: 80 }}
                          />
                        </td>
                        <td>
                          <input
                            name="unit"
                            value={editForm.unit}
                            onChange={handleEditChange}
                            style={{ width: 80 }}
                          />
                        </td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleSaveEdit(product.id)}>บันทึก</button>
                          <button
                            onClick={cancelEdit}
                            style={{ backgroundColor: '#9ca3af' }}
                          >
                            ยกเลิก
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{Number(product.price).toFixed(2)}</td>
                        <td>{product.stock}</td>
                        <td>{product.unit}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(product)}>แก้ไข</button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            ลบ
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
