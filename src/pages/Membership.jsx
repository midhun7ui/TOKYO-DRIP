import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Crown, Star, Shield, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import './Membership.css';

const Membership = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingRequest, setPendingRequest] = useState(null);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'silver',
            tier: 1,
            name: 'Silver',
            price: '$9.99/mo',
            icon: <Star size={32} className="text-gray-400" />,
            accClass: 'silver-acc',
            features: ['Early Access to Drops', 'Free Standard Shipping', '5% Off All Orders']
        },
        {
            id: 'gold',
            tier: 2,
            name: 'Gold',
            price: '$19.99/mo',
            icon: <Crown size={32} className="text-yellow-400" />,
            accClass: 'gold-acc',
            features: ['Everything in Silver', 'Priority Dispatch (12h)', '10% Off All Orders', 'Exclusive Gold-Only Items']
        },
        {
            id: 'platinum',
            tier: 3,
            name: 'Platinum',
            price: '$49.99/mo',
            icon: <Shield size={32} className="text-cyan-400" />,
            accClass: 'platinum-acc',
            features: ['Everything in Gold', 'Same-Day Dispatch', '20% Off All Orders', 'Personal Stylist Support', 'VIP Events Access']
        }
    ];

    // Derived Active Plan from User Profile (Real-time)
    const activePlan = (userProfile?.membershipStatus === 'active' && userProfile?.membershipPlan) ? {
        planId: userProfile.membershipPlan,
        planName: userProfile.membershipPlanName || plans.find(p => p.id === userProfile.membershipPlan)?.name || 'Unknown',
        status: 'approved'
    } : null;

    useEffect(() => {
        const checkPendingRequests = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Only fetch PENDING requests. Approved/Revoked status is handled via userProfile.
                const q = query(
                    collection(db, 'membershipRequests'),
                    where('userId', '==', currentUser.uid),
                    where('status', '==', 'pending'),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setPendingRequest(querySnapshot.docs[0].data());
                } else {
                    setPendingRequest(null);
                }
            } catch (error) {
                console.error("Error checking requests:", error);
            } finally {
                setLoading(false);
            }
        };

        checkPendingRequests();
    }, [currentUser]);

    const handlePlanClick = (plan) => {
        if (!currentUser) {
            navigate('/login', { state: { from: '/membership' } });
            return;
        }

        if (pendingRequest) {
            toast.error(`You already have a pending request for ${pendingRequest.planName}. Please wait for approval.`);
            return;
        }

        // Open Payment Modal
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (paymentId) => {
        try {
            // 1. Add 'approved' request record (History)
            await addDoc(collection(db, 'membershipRequests'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: currentUser.displayName || 'Anonymous',
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                status: 'approved', // Auto-approve triggered by payment
                type: activePlan ? 'upgrade' : 'new',
                paymentId: paymentId,
                amount: selectedPlan.price,
                createdAt: serverTimestamp()
            });

            // 2. Update User Profile global status (Main State)
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                membershipStatus: 'active',
                membershipPlan: selectedPlan.id,
                membershipPlanName: selectedPlan.name,
                membershipValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            });

            // Note: We don't need to manually update local state anymore because
            // userProfile from AuthContext will update automatically via Firestore listener.

            toast.success(`Welcome to the ${selectedPlan.name} Inner Circle!`);
            setIsPaymentModalOpen(false);
        } catch (error) {
            console.error("Error activating membership:", error);
            toast.error("Payment successful but activation failed. Please contact support.");
        }
    };

    const getButtonState = (plan) => {
        // If user has a pending request for ANY plan, disable everything
        if (pendingRequest) {
            if (pendingRequest.planId === plan.id) return { text: 'Request Pending', disabled: true, className: 'disabled' };
            return { text: 'Request Pending', disabled: true, className: 'disabled' };
        }

        // If user has an active plan
        if (activePlan) {
            if (activePlan.planId === plan.id) {
                return { text: 'Current Plan', disabled: true, className: 'active' };
            }

            // Compare tiers to determine if upgrade available
            const currentTier = plans.find(p => p.id === activePlan.planId)?.tier || 0;
            if (plan.tier > currentTier) {
                return { text: 'Upgrade', disabled: false, className: 'primary' };
            } else {
                return { text: 'Downgrade Unavailable', disabled: true, className: 'disabled' };
            }
        }

        // Default state (no active plan, no pending request)
        return { text: 'Request Access', disabled: false, className: 'primary' };
    };

    if (loading && currentUser) return <div className="membership-page" style={{ textAlign: 'center', paddingTop: '10rem' }}>Loading...</div>;

    return (
        <div className="membership-page">
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
            />

            {/* Header */}
            <div className="membership-header">
                <span className="membership-chip">Inner Circle</span>
                <h1 className="membership-title">
                    JOIN THE <span>ELITE</span>
                </h1>
                <p className="membership-desc">
                    Unlock exclusive benefits, early access, and premium services.
                    <br />
                    Elevate your drip to the next level.
                </p>
            </div>

            {/* Current Status Banner */}
            {(activePlan || pendingRequest) && (
                <div className="status-banner">
                    <div className="status-content">
                        <span className="status-label">Membership Status</span>
                        <div style={{ fontSize: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {activePlan && (
                                <div>
                                    Active Plan: <strong>{activePlan.planName}</strong>
                                    <span className="status-badge approved">
                                        <Check size={14} /> Active
                                    </span>
                                </div>
                            )}
                            {pendingRequest && (
                                <div>
                                    Pending Request: <strong>{pendingRequest.planName}</strong>
                                    <span className="status-badge pending">
                                        Pending
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Grid */}
            <div className="plans-grid">
                {plans.map((plan) => {
                    const btnState = getButtonState(plan);
                    const isActive = activePlan?.planId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`pricing-card ${plan.accClass} ${isActive ? 'active' : ''}`}
                        >
                            <div className="card-glow" />

                            <div className="card-header">
                                <div className="card-icon">
                                    {plan.icon}
                                </div>
                                {plan.id === 'gold' && <span className="popular-tag">Popular</span>}
                            </div>

                            <div>
                                <h3 className="plan-name">{plan.name}</h3>
                                <div className="plan-price">
                                    {plan.price.split('/')[0]}
                                    <span>/mo</span>
                                </div>
                            </div>

                            <div className="divider" />

                            <ul className="features-list">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="feature-item">
                                        <Check size={18} className="feature-check" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePlanClick(plan)}
                                disabled={btnState.disabled}
                                className={`plan-btn ${btnState.className}`}
                            >
                                {btnState.text}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Membership;
