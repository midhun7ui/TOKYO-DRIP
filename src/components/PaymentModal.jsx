import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import './PaymentModal.css';

// Use the same test key as PaymentForm.jsx for consistency
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ plan, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        // 1. Create Payment Method (Client Side)
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            setIsProcessing(false);
        } else {
            console.log('[PaymentMethod Created]', paymentMethod);

            // 2. Simulate Backend Processing (Since we are in "Test Mode")
            setTimeout(() => {
                toast.success("Payment Successful (Test Mode)");
                onSuccess(paymentMethod.id); // Pass the ID back
                setIsProcessing(false);
            }, 1500);
        }
    };

    const cardStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: '"Outfit", sans-serif',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.3)',
                },
                iconColor: '#ff8a00',
                lineHeight: '24px'
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444'
            },
        },
        hidePostalCode: true
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="stripe-card-container">
                <CardElement options={cardStyle} />
            </div>

            {error && (
                <div className="p-3 my-4 rounded-lg text-sm bg-red-500/20 text-red-400 border border-red-500/30">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe}
                className="pay-button"
            >
                {isProcessing ? (
                    <>
                        <div className="spinner" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Pay {plan.price}
                    </>
                )}
            </button>
        </form>
    );
};

const PaymentModal = ({ plan, isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-content">
                <button
                    onClick={onClose}
                    className="modal-close-btn"
                >
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div className="plan-icon-wrapper">
                        {plan.icon}
                    </div>
                    <h2 className="modal-title">Secure Checkout</h2>
                    <p className="modal-subtitle">
                        Upgrade to <span style={{ color: 'var(--accent, #eab308)', fontWeight: 'bold' }}>{plan.name}</span> Plan
                    </p>
                    <div className="modal-price">{plan.price}</div>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        plan={plan}
                        onSuccess={onSuccess}
                        onClose={onClose}
                    />
                </Elements>

                <div className="secure-badge">
                    <Lock size={12} />
                    Secured by Stripe (Test Mode)
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
