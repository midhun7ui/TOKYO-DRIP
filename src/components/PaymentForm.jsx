import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

// Using a standard test key from Stripe docs
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ onSuccess, onCancel, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentMethodType, setPaymentMethodType] = useState('card'); // 'card' or 'cod'

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (paymentMethodType === 'cod') {
            // Simulate processing delay for COD
            setTimeout(() => {
                onSuccess({ id: `cod_${Date.now()}`, type: 'cod' });
                setProcessing(false);
            }, 1000);
            return;
        }

        if (!stripe || !elements) {
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            setProcessing(false);
        } else {
            console.log('[PaymentMethod]', paymentMethod);
            // Simulate backend processing delay
            setTimeout(() => {
                onSuccess(paymentMethod);
                setProcessing(false);
            }, 1500);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h3 className="payment-title">Payment Method</h3>

            <div className="payment-body space-y-6">
                {/* Payment Selection */}
                {/* Payment Selection */}
                <div className="payment-methods-grid">
                    {/* Card Option */}
                    <div
                        onClick={() => setPaymentMethodType('card')}
                        className={`payment-option-card ${paymentMethodType === 'card' ? 'active' : ''}`}
                    >
                        <div className="payment-option-info">
                            <div className="payment-option-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            </div>
                            <div className="payment-option-text">
                                <span className="payment-option-title">Credit / Debit Card</span>
                                <span className="payment-option-subtitle">Pay securely with Stripe</span>
                            </div>
                        </div>
                        <div className="payment-radio-circle">
                            <div className="payment-radio-dot"></div>
                        </div>
                    </div>

                    {/* COD Option */}
                    <div
                        onClick={() => setPaymentMethodType('cod')}
                        className={`payment-option-card ${paymentMethodType === 'cod' ? 'active' : ''}`}
                    >
                        <div className="payment-option-info">
                            <div className="payment-option-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <div className="payment-option-text">
                                <span className="payment-option-title">Cash on Delivery</span>
                                <span className="payment-option-subtitle">Pay with cash upon arrival</span>
                            </div>
                        </div>
                        <div className="payment-radio-circle">
                            <div className="payment-radio-dot"></div>
                        </div>
                    </div>
                </div>

                {paymentMethodType === 'card' ? (
                    <>
                        <label className="payment-label">Card Information</label>
                        <div className="card-element-wrapper">
                            <CardElement options={{
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
                            }} />
                        </div>

                        <div className="payment-icons">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/1200px-Visa.svg.png" alt="Visa" className="pay-icon visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="pay-icon mastercard" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="pay-icon paypal" />
                        </div>
                    </>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-white/80 text-sm">
                            You can pay in cash when your order is delivered.
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="payment-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="payment-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="btn-back"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={paymentMethodType === 'card' && (!stripe || processing)}
                    className="btn-pay"
                >
                    {processing ? (
                        <>
                            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        paymentMethodType === 'card' ? `Pay $${amount}` : 'Place Order'
                    )}
                </button>
            </div>
        </form>
    );
};

const PaymentForm = ({ amount, onSuccess, onCancel }) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
);

export default PaymentForm;
