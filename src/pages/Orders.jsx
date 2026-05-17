import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../api';
import { Search, Eye, Trash2, X, ShoppingCart } from 'lucide-react';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['pending', 'paid', 'cod', 'failed', 'refunded'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ status: statusFilter });
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handlePaymentChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { paymentStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting order');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {statusOptions.map((s) => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--warm-gray)' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-gray)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card empty-state">
          <ShoppingCart />
          <h3>No Orders Found</h3>
          <p>Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.orderNumber || order._id.slice(-8)}</td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 500 }}>{order.customerInfo?.name || '-'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--warm-gray)' }}>{order.customerInfo?.phone || ''}</p>
                    </div>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td style={{ fontWeight: 700, color: 'var(--navy)' }}>${order.total?.toFixed(2)}</td>
                  <td>
                    <select
                      className="status-select"
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                    >
                      {paymentOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--warm-gray)', whiteSpace: 'nowrap' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(order._id)}>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h2>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>Customer Details</h4>
                <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '16px' }}>
                  <p><strong>Name:</strong> {selectedOrder.customerInfo?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
                  <p><strong>Address:</strong> {selectedOrder.customerInfo?.address}</p>
                  {selectedOrder.customerInfo?.city && <p><strong>City:</strong> {selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.state} {selectedOrder.customerInfo.pincode}</p>}
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>Order Items</h4>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--sand)' }}>
                    <div>
                      <p style={{ fontWeight: 500 }}>{item.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--warm-gray)' }}>Color: {item.selectedColor} • Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span>Subtotal</span><span>${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span>Shipping</span><span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping?.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span>Tax</span><span>${selectedOrder.tax?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--stone)', fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  <span>Total</span><span>${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <span className={`badge badge-${selectedOrder.orderStatus}`}>{selectedOrder.orderStatus}</span>
                <span className={`badge badge-${selectedOrder.paymentStatus}`}>{selectedOrder.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
