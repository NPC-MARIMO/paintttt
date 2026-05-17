import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { Plus, Search, Edit2, Trash2, X, Upload, Package } from 'lucide-react';

const API_URL = 'http://localhost:8080';

const categories = [
  { value: 'interior', label: 'Interior' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'waterproofing', label: 'Waterproofing' },
  { value: 'primers', label: 'Primers' },
];

const finishes = [
  { value: 'matte', label: 'Matte' },
  { value: 'satin', label: 'Satin' },
  { value: 'semi-gloss', label: 'Semi-Gloss' },
  { value: 'gloss', label: 'Gloss' },
];

const emptyProduct = {
  name: '', category: 'interior', price: '', originalPrice: '',
  colors: '', finish: 'matte', coverage: '', description: '',
  features: '', usage: '', isBestSeller: false, stock: '100'
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ search });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      colors: product.colors?.join(', ') || '',
      finish: product.finish,
      coverage: product.coverage || '',
      description: product.description || '',
      features: product.features?.join('\n') || '',
      usage: product.usage || '',
      isBestSeller: product.isBestSeller || false,
      stock: product.stock?.toString() || '100'
    });
    setImageFile(null);
    setImagePreview(product.image ? `${API_URL}${product.image}` : '');
    setError('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('price', form.price);
      if (form.originalPrice) formData.append('originalPrice', form.originalPrice);
      formData.append('colors', JSON.stringify(form.colors.split(',').map(c => c.trim()).filter(Boolean)));
      formData.append('finish', form.finish);
      formData.append('coverage', form.coverage);
      formData.append('description', form.description);
      formData.append('features', JSON.stringify(form.features.split('\n').map(f => f.trim()).filter(Boolean)));
      formData.append('usage', form.usage);
      formData.append('isBestSeller', form.isBestSeller);
      formData.append('stock', form.stock);
      if (imageFile) formData.append('image', imageFile);

      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <Search />
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-gray)' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <Package />
          <h3>No Products Found</h3>
          <p>Add your first product or seed default products from the dashboard.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Best Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.image ? (
                      <img src={`${API_URL}${p.image}`} alt={p.name} className="product-thumb" />
                    ) : (
                      <div className="product-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="var(--warm-gray)" />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                  <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>⭐ {p.rating}</td>
                  <td>{p.isBestSeller ? <span className="badge badge-active">Yes</span> : <span className="badge badge-inactive">No</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" onClick={() => openEditModal(p)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-msg" style={{ background: 'var(--red-light)', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

                {/* Image Upload */}
                <div className="form-group">
                  <label>Product Image</label>
                  <label className="image-upload">
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <Upload size={32} color="var(--warm-gray)" />
                    )}
                    <p>{imagePreview ? 'Click to change image' : 'Click to upload product image'}</p>
                  </label>
                </div>

                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Finish *</label>
                    <select className="form-control" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })}>
                      {finishes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input type="number" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Original Price ($)</label>
                    <input type="number" step="0.01" className="form-control" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" className="form-control" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Coverage</label>
                    <input type="text" className="form-control" value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} placeholder="e.g. 350-400 sq ft per gallon" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Colors (comma separated)</label>
                  <input type="text" className="form-control" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="White, Gray, Blue" />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Features (one per line)</label>
                  <textarea className="form-control" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
                </div>

                <div className="form-group">
                  <label>Usage Instructions</label>
                  <textarea className="form-control" value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} />
                    Mark as Best Seller
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
