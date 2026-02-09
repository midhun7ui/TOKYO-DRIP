import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import PaymentForm from '../components/PaymentForm';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false); // New state for payment step

    // Check for Buy Now item passed via state
    const buyNowItem = location.state?.buyNowItem;

    // Use Buy Now item if present, otherwise use Cart items
    const finalCartItems = buyNowItem ? [buyNowItem] : cartItems;

    // Calculate total for Buy Now item
    const finalTotal = buyNowItem
        ? (buyNowItem.offerPercentage > 0
            ? buyNowItem.price - (buyNowItem.price * (buyNowItem.offerPercentage / 100))
            : buyNowItem.price) * buyNowItem.quantity
        : cartTotal;

    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'India',
        phone: ''
    });

    // Fetch User Profile Data
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setShippingDetails(prev => ({
                            ...prev,
                            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || currentUser.displayName || '',
                            email: currentUser.email || '',
                            phone: data.phoneNumber || '',
                            address: data.address || '',
                            zipCode: data.pinCode || '',
                            city: data.city || ''
                        }));
                    } else {
                        // Fallback to Auth data if no profile
                        setShippingDetails(prev => ({
                            ...prev,
                            fullName: currentUser.displayName || '',
                            email: currentUser.email || ''
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching user data for checkout:", err);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleChange = (e) => {
        setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
    };

    const handleAddPaymentDetails = (e) => {
        e.preventDefault();
        // wrapper for validation check
        const form = document.getElementById('checkout-form');
        if (form.checkValidity()) {
            setShowPayment(true);
        } else {
            form.reportValidity();
        }
    };

    const handlePaymentSuccess = async (paymentMethod) => {
        setLoading(true);

        try {
            // Create Order Object
            const orderData = {
                userId: currentUser?.uid || 'guest',
                userEmail: shippingDetails.email,
                items: finalCartItems.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    offerPercentage: item.offerPercentage || 0,
                    finalPrice: item.offerPercentage > 0
                        ? item.price - (item.price * (item.offerPercentage / 100))
                        : item.price,
                    quantity: item.quantity,
                    image: item.images?.[0] || ''
                })),
                totalAmount: finalTotal,
                shippingDetails,
                status: 'pending',
                paymentMethod: paymentMethod.type === 'cod' ? 'Cash on Delivery' : 'Stripe',
                paymentId: paymentMethod.id, // Save Stripe Payment ID or COD ID
                createdAt: serverTimestamp()
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log("Order placed with ID: ", docRef.id);

            // Clear Cart ONLY if it was a normal cart checkout
            if (!buyNowItem) {
                clearCart();
            }

            // Redirect to Success
            navigate('/order-success', { state: { orderId: docRef.id } });

        } catch (error) {
            console.error("Error placing order: ", error);
            alert("Failed to place order. Please try again.");
            setLoading(false); // stop loading on error
        }
    };

    if (finalCartItems.length === 0) {
        return (
            <div className="shell pt-32 text-center">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/new-in')} className="mt-4 px-6 py-2 bg-white text-black rounded-full">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="shell pt-28 pb-20">
            <h2 className="text-3xl font-bold font-display mb-8">Checkout {buyNowItem && '(Buy Now)'}</h2>

            <div className="checkout-layout">
                {/* Left: Shipping Form or Payment Form */}
                <div className="checkout-main">
                    <div className="glass-panel h-full flex flex-col transition-all duration-300">

                        {!showPayment ? (
                            <>
                                <h3 className="text-xl font-bold mb-10 min-h-[28px]">Shipping Details</h3>
                                <form id="checkout-form" className="checkout-form flex-1">
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input required name="fullName" value={shippingDetails.fullName} onChange={handleChange} className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input required type="email" name="email" value={shippingDetails.email} onChange={handleChange} className="form-input" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <input required name="address" value={shippingDetails.address} onChange={handleChange} className="form-input" placeholder="Street address, Apt, Suite" />
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input required name="city" value={shippingDetails.city} onChange={handleChange} className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ZIP Code</label>
                                            <input required name="zipCode" value={shippingDetails.zipCode} onChange={handleChange} className="form-input" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input required type="tel" name="phone" value={shippingDetails.phone} onChange={handleChange} className="form-input" placeholder="+91 99999 99999" />
                                    </div>
                                </form>
                            </>
                        ) : (
                            <PaymentForm
                                amount={finalTotal.toFixed(2)}
                                onSuccess={handlePaymentSuccess}
                                onCancel={() => setShowPayment(false)}
                            />
                        )}

                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="checkout-sidebar">
                    <div className="glass-panel summary-card h-full flex flex-col">
                        <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                        <div className="summary-items-list custom-scrollbar flex-1">
                            {finalCartItems.map(item => (
                                <div key={item._id} className="summary-item">
                                    <div className="flex-shrink-0">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.name} className="summary-item-img" />
                                        ) : (
                                            <div className="summary-item-img flex items-center justify-center text-xs opacity-50 bg-white/5">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-xs opacity-60">Qty: {item.quantity}</p>
                                        <p className="text-sm font-bold text-orange-500">
                                            ${((item.offerPercentage > 0 ? item.price * (1 - item.offerPercentage / 100) : item.price) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 py-4 border-t border-white/10">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="summary-total">
                                <span className="total-label">Total</span>
                                <span className="total-value">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {!showPayment && (
                            <button
                                type="button"
                                onClick={handleAddPaymentDetails}
                                className="checkout-btn"
                            >
                                Add Payment Details
                            </button>
                        )}

                        <div className="mt-4 text-center">
                            <Link to="/new-in" className="w-full py-4 rounded-xl border border-white/20 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white hover:text-black transition-all group">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>

                        <p className="text-xs text-center mt-4 opacity-50">
                            By placing your order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
