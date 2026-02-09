import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Orders = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) return;

            try {
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', currentUser.uid)
                );

                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Client-side sort to avoid missing index issues
                ordersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="shell pt-32 text-center">
                <h2>Please login to view your orders.</h2>
                <Link to="/login" className="btn-primary mt-4 inline-block">Login</Link>
            </div>
        );
    }

    if (loading) {
        return <div className="shell pt-32 text-center">Loading orders...</div>;
    }

    return (
        <div className="shell pt-28 pb-20">
            <h2 className="text-3xl font-bold font-display mb-8">Your Orders</h2>

            {orders.length === 0 ? (
                <div className="empty-orders glass-panel text-center py-12">
                    <p className="opacity-60 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/new-in" className="btn-primary inline-block">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-list space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="glass-panel order-card">
                            <div className="order-header">
                                <div className="order-meta">
                                    <p className="meta-label">Order ID</p>
                                    <p className="meta-value font-mono">{order.id}</p>
                                </div>
                                <div className="order-meta">
                                    <p className="meta-label">Date</p>
                                    <p className="meta-value">
                                        {order.createdAt?.seconds
                                            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                            : order.createdAt?.toDate
                                                ? order.createdAt.toDate().toLocaleDateString()
                                                : 'N/A'}
                                    </p>
                                </div>
                                <div className="order-meta">
                                    <p className="meta-label">Total Amount</p>
                                    <p className="meta-value highlight">${order.totalAmount?.toFixed(2)}</p>
                                </div>
                                <div className="order-meta">
                                    <p className="meta-label">Status</p>
                                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <Link to={`/order/${order.id}`} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition text-sm font-semibold flex items-center gap-2 self-center md:self-start">
                                    Details
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                                </Link>
                            </div>

                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <div className="item-image-wrapper">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="item-image" />
                                            ) : (
                                                <div className="no-image">No Img</div>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-meta">Qty: {item.quantity} × ${item.finalPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="item-total">
                                            ${(item.finalPrice * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
