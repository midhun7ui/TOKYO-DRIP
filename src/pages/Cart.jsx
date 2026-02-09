import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="shell empty-cart">
                <span className="empty-icon">🛍️</span>
                <h2 className="text-3xl font-display font-bold mb-4">Your bag is empty</h2>
                <p className="mb-8 opacity-60">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/new-in" className="primary inline-block no-underline" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="shell pt-28 pb-20">
            <h2 className="text-4xl font-display font-bold mb-10">Your Cart ({cartItems.length})</h2>

            <div className="cart-container">
                {/* Cart Items List */}
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div key={item._id} className="cart-item">
                            <div className="cart-item-image-wrapper">
                                {item.images && item.images[0] ? (
                                    <img src={item.images[0]} alt={item.name} className="cart-item-image" />
                                ) : (
                                    <div className="cart-item-image flex items-center justify-center text-xs opacity-50">No Img</div>
                                )}
                            </div>

                            <div className="cart-item-details">
                                <div className="cart-item-header">
                                    <div>
                                        <h3 className="cart-item-title">{item.name}</h3>
                                        <p className="cart-item-category">{item.category}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="remove-btn"
                                        title="Remove item"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>

                                <div className="cart-item-footer">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="qty-btn"
                                            disabled={item.quantity <= 1}
                                        >−</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="qty-btn"
                                            disabled={item.quantity >= 10}
                                        >+</button>
                                    </div>

                                    <div className="cart-item-price">
                                        {item.offerPercentage > 0 && (
                                            <div className="price-offer">
                                                SAVE {item.offerPercentage}%
                                            </div>
                                        )}
                                        <div className="price-final">
                                            ${(
                                                (item.offerPercentage > 0
                                                    ? item.price - (item.price * (item.offerPercentage / 100))
                                                    : item.price) * item.quantity
                                            ).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Section */}
                <div>
                    <div className="cart-summary">
                        <h3 className="text-xl font-bold mb-8">Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>$0.00</span>
                        </div>

                        <div className="summary-total">
                            <span className="total-label">Total</span>
                            <span className="total-value">${cartTotal.toFixed(2)}</span>
                        </div>

                        <Link to="/checkout" className="checkout-btn">
                            Proceed to Checkout
                        </Link>

                        <div className="mt-4 text-center">
                            <Link to="/new-in" className="w-full py-4 rounded-xl border border-white/20 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white hover:text-black transition-all group">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
