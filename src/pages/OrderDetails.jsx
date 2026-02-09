import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const OrderDetails = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;

            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Order not found.");
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div className="shell pt-32 text-center">Loading order details...</div>;
    if (error) return <div className="shell pt-32 text-center text-red-500">{error}</div>;
    if (!order) return <div className="shell pt-32 text-center">Order not found.</div>;

    return (
        <div className="shell pt-28 pb-20">
            <div className="order-details-header">
                <Link to="/orders" className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </Link>
                <h1>Order Details</h1>
            </div>

            {/* Order Timeline */}
            {!['cancelled'].includes(order.status?.toLowerCase()) && (
                <div className="glass-panel p-8 mb-8">
                    <div className="timeline-container">
                        {[
                            { id: 'pending', label: 'Order Placed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                            { id: 'shipped', label: 'Shipped', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
                            { id: 'out-for-delivery', label: 'Out for Delivery', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
                            { id: 'delivered', label: 'Delivered', icon: 'M5 13l4 4L19 7' }
                        ].map((step, index, array) => {
                            const statusOrder = ['pending', 'shipped', 'out-for-delivery', 'delivered'];
                            const currentStatusIndex = statusOrder.indexOf(order.status?.toLowerCase());
                            const stepIndex = statusOrder.indexOf(step.id);
                            const isActive = stepIndex <= currentStatusIndex && currentStatusIndex !== -1;
                            const isCompleted = stepIndex < currentStatusIndex;

                            return (
                                <div key={step.id} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <div className="step-icon">
                                            {isCompleted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                                            )}
                                        </div>
                                        {index !== array.length - 1 && <div className="step-line"></div>}
                                    </div>
                                    <p className="step-label">{step.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="glass-panel p-8 order-details-content">
                {/* Header Information */}
                <div className="order-info-row">
                    <div className="info-group">
                        <p className="label">Order ID</p>
                        <p className="value font-mono">{order.id}</p>
                    </div>
                    <div className="info-group">
                        <p className="label">Date Placed</p>
                        <p className="value">
                            {order.createdAt?.seconds
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                : order.createdAt?.toDate
                                    ? order.createdAt.toDate().toLocaleDateString()
                                    : 'N/A'}
                        </p>
                    </div>
                    <div className="info-group">
                        <p className="label">Total Amount</p>
                        <p className="value highlight text-orange-500">${order.totalAmount?.toFixed(2)}</p>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Shipping Address */}
                    <div className="details-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            Shipping Address
                        </h3>
                        <div className="card-content">
                            <p className="font-bold mb-1">{order.shippingDetails?.fullName}</p>
                            <p>{order.shippingDetails?.address}</p>
                            <p>{order.shippingDetails?.city}, {order.shippingDetails?.zipCode}</p>
                            <p>{order.shippingDetails?.country}</p>
                            <p className="mt-2 opacity-60 text-xs">Phone: {order.shippingDetails?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="details-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            Payment Info
                        </h3>
                        <div className="card-content">
                            <div className="row">
                                <span>Method:</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="row">
                                <span>Status:</span>
                                <span className="uppercase font-bold text-green-400">{order.status}</span>
                            </div>
                            {order.paymentId && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <p className="opacity-50 text-xs mb-1">Transaction ID</p>
                                    <p className="font-mono text-xs break-all">{order.paymentId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="details-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                            Summary
                        </h3>
                        <div className="card-content">
                            <div className="row">
                                <span className="opacity-60">Subtotal</span>
                                <span>${order.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span className="opacity-60">Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="row total-row">
                                <span>Total</span>
                                <span className="text-orange-500">${order.totalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <h3 className="section-title">Items Ordered</h3>
                <div className="items-list">
                    {order.items?.map((item, index) => (
                        <div key={index} className="item-card">
                            <div className="item-image-container">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} />
                                ) : (
                                    <div className="no-image">No Img</div>
                                )}
                            </div>

                            <div className="item-info">
                                <p className="name">{item.name}</p>
                                <p className="price">Unit Price: ${item.finalPrice?.toFixed(2)}</p>
                            </div>

                            <div className="item-totals">
                                <p className="qty">Qty: {item.quantity}</p>
                                <p className="total">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
