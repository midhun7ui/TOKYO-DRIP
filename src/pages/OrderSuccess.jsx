import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;
    const [showConfetti, setShowConfetti] = React.useState(true);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
        }

        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, [orderId, navigate]);

    if (!orderId) return null;

    return (
        <div className="order-success-page shell">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} colors={['#ff8a00', '#ff4d00', '#ffffff']} />}

            <div className="success-card glass-panel">
                <div className="success-icon-container">
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>

                <h1 className="success-title">Order Placed Successfully!</h1>

                <p className="success-message">
                    Thank you for your purchase. Your order <span className="order-id">{orderId}</span> has been confirmed.
                </p>

                <div className="success-actions">
                    <Link to="/orders" className="btn-secondary">
                        View Order
                    </Link>
                    <Link to="/new-in" className="btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
