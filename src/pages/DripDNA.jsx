import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Sparkles, Send, RefreshCw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const DripDNA = () => {
    const [vibe, setVibe] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [outfit, setOutfit] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'products'));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(data);
            } catch (error) {
                console.error("Failed to load catalog:", error);
            }
        };
        fetchCatalog();
    }, []);

    const generateDrip = async (e) => {
        e.preventDefault();
        if (!vibe.trim()) return;

        setLoading(true);
        setOutfit(null);

        // SIMULATION MODE: Default to random selection since no API Key
        setTimeout(() => {
            if (products.length < 3) {
                toast.error("Not enough items in the archive to generate a fit.");
                setLoading(false);
                return;
            }

            // Shuffle and pick 3
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            setOutfit({
                vibe: vibe,
                explanation: `Based on your "${vibe}" energy, we've curated this look. It mixes high-performance tech wear with underground aesthetics to match your request.`,
                items: selected
            });

            setLoading(false);
        }, 2000);
    };

    const addAllToCart = () => {
        if (!outfit) return;
        outfit.items.forEach(item => {
            addToCart({ ...item, _id: item.id });
        });
        toast.success("Full fit added to cart! 🛒");
    };

    return (
        <div className="w-full relative isolate">
            {/* Background Orbs */}
            <div className="drip-bg-orb" style={{ top: '20%', left: '20%', width: '500px', height: '500px', background: 'rgba(147, 51, 234, 0.15)' }} />
            <div className="drip-bg-orb" style={{ bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(234, 88, 12, 0.1)' }} />

            <div className="drip-container pt-8 md:pt-16 pb-24">
                <div className="drip-header">
                    <div className="drip-badge">
                        <Sparkles size={14} />
                        Next-Gen Styling
                    </div>
                    <h1 className="drip-title">
                        <span className="gradient-text">DRIP</span> <span className="text-purple">DNA</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        The AI stylist that knows your vibe before you do.
                        <br className="hidden md:block" /> Tell us what you're feeling; we'll handle the fit.
                    </p>
                </div>

                {/* Input Section */}
                <form onSubmit={generateDrip} className="drip-input-wrapper">
                    <div className="drip-input-container">
                        <div style={{ paddingLeft: '1rem', paddingRight: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                            <Sparkles size={24} />
                        </div>
                        <input
                            type="text"
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="Describe the occasion or mood..."
                            className="drip-input"
                        />
                        <button
                            type="submit"
                            disabled={loading || !vibe}
                            className="drip-btn"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>

                    {/* Suggested Chips */}
                    <div className="drip-chips">
                        {['Cyberpunk CEO', 'Y2K Glitch', 'Late Night Drive', 'Underground Rave', 'Cozy Sunday'].map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => setVibe(suggestion)}
                                className="drip-chip"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="relative inline-flex mb-6" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
                            <Sparkles size={24} className="text-purple" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                        </div>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>
                            Scanning archives for <span className="text-purple">"{vibe}"</span>...
                        </p>
                    </div>
                )}

                {/* Results Section */}
                {outfit && !loading && (
                    <div className="w-full px-4 animate-fade-in-up">
                        <div className="drip-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Curated Look</div>
                                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>The "{outfit.vibe}" Fit</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: '1.6' }}>{outfit.explanation}</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>Match 98%</span>
                                </div>
                            </div>

                            <div className="drip-grid">
                                {outfit.items.map((item, idx) => (
                                    <Link to={`/product/${item.id}`} key={item.id} className="drip-item group block">
                                        <div className="drip-item-img">
                                            {item.images && item.images[0] ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No Image</div>
                                            )}
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: '700', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                0{idx + 1}
                                            </div>
                                        </div>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>${item.price}</p>
                                    </Link>
                                ))}
                            </div>

                            <button onClick={addAllToCart} className="drip-action-btn">
                                <ShoppingBag size={20} />
                                <span>Cop The Full Fit</span>
                                <span style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                    ${outfit.items.reduce((a, b) => a + (b.price || 0), 0)}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DripDNA;
