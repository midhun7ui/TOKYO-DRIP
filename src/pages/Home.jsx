import React, { useState, useEffect } from 'react';
import '../App.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const quickLinks = ['New In', 'Collections', 'Studio', 'Shipping', 'Support']

const tiles = [
    { title: 'Pulse Jackets', note: 'Reflective weave' },
    { title: 'Orbit Tech', note: 'Modular carry' },
    { title: 'Sable Home', note: 'Tactile calm' },
    { title: 'Analog Audio', note: 'Warm signal' },
    { title: 'Drift Knit', note: 'Adaptive fit' },
    { title: 'Studio Tools', note: 'Desk rituals' },
]

const highlights = [
    { title: 'Black label drops', copy: 'Small batches with studio notes and serial numbers.' },
    { title: '24-hour dispatch', copy: 'Urban micro-warehouses deliver fast without waste.' },
    { title: 'Repair-first mindset', copy: 'Parts, care kits, and QR repair guides included.' },
]

import { Link } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));
                // Sort by createdAt descending if possible, or just reverse
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Get items marked for Drop Preview only
    const latestDrops = products.filter(p => p.collectionTypes?.includes('drop-preview')).slice(0, 4);

    return (
        <div className="shell">
            <section className="hero" id="newin">
                <div className="hero-left">
                    <p className="overline">Season 07 · Street Collection</p>
                    <h1>Premium fashion for those who set the trends.</h1>
                    <p className="lead">
                        A curated destination for modern style, urban essentials, and
                        exclusive drops — all designed for your unique look.
                    </p>
                    <div className="hero-actions">
                        <Link to="/new-in" className="primary">Browse the drop</Link>
                        <button className="ghost">View lookbook</button>
                    </div>
                    <div className="hero-metrics">
                        <div><span className="metric">480+</span><span className="metric-label">Studio partners</span></div>
                        <div><span className="metric">2.4m</span><span className="metric-label">Design lovers</span></div>
                        <div><span className="metric">24h</span><span className="metric-label">Dispatch window</span></div>
                    </div>
                </div>
                <div className="hero-right">
                    <div className="hero-stack">
                        <div className="stack-card">
                            <span className="chip">Drop preview</span>
                            <h3>Tonight’s curated release</h3>
                            <div className="stack-grid">
                                {loading ? <p>Loading drops...</p> : latestDrops.length > 0 ? (
                                    latestDrops.map((product) => (
                                        <Link to={`/product/${product._id}`} key={product._id} className="block hover:bg-white/5 transition p-2 rounded-lg">
                                            <article className="flex items-center gap-4">
                                                {product.images && product.images[0] && (
                                                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded bg-white/10 object-cover" />
                                                )}
                                                <div>
                                                    <h4 className="text-white">{product.name}</h4>
                                                    <p className="text-sm opacity-60">${product.price}</p>
                                                </div>
                                            </article>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-4 text-center opacity-50">
                                        <p className="text-sm">No upcoming drops revealed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="stack-card alt">
                            <p>Members get early access + restock alerts.</p>
                            <Link to="/membership" className="ghost">Join the club</Link>
                        </div>
                    </div>
                    <div className="hero-orb" />
                </div>
            </section>

            <section className="marquee">
                <div className="track">
                    <span>Limited drops</span>
                    <span>Studio notes</span>
                    <span>Certified sourcing</span>
                    <span>Serialized ownership</span>
                    <span>Modular systems</span>
                    <span>Limited drops</span>
                    <span>Studio notes</span>
                </div>
            </section>

            <section className="tiles" id="collections">
                <div className="section-head">
                    <h2>Collections built around light and texture.</h2>
                    <p>Every category is a visual moodboard: matte blacks, bright oranges, and crisp whites.</p>
                </div>
                <div className="tile-grid">
                    {tiles.map((tile) => (
                        <article key={tile.title} className="tile-card">
                            <h3>{tile.title}</h3>
                            <p>{tile.note}</p>
                            <button className="link">Explore</button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bento" id="studio">
                <div className="bento-card large">
                    <h3>Studio-grade curation for everyday life.</h3>
                    <p>We partner with independent makers and design labs. Every release includes provenance notes, material breakdowns, and small-batch numbering.</p>
                    <button className="primary">Meet the studios</button>
                </div>
                {highlights.map((item) => (
                    <div className="bento-card" key={item.title}>
                        <h4>{item.title}</h4>
                        <p>{item.copy}</p>
                    </div>
                ))}
            </section>

            <section className="featured">
                <div className="section-head">
                    <h2>Featured drops</h2>
                    <p>Small-batch runs with serialized ownership cards.</p>
                </div>
                <div className="featured-grid">
                    {loading ? <p>Loading products...</p> : products.map((product) => (
                        <Link to={`/product/${product._id}`} key={product._id} className="block group">
                            <article className="featured-card h-full">
                                <div className="card-image-container">
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                                    )}
                                    <span className="absolute top-2 left-2 chip">{product.category || 'New'}</span>
                                </div>
                                <div className="flex justify-between items-start mt-4">
                                    <div>
                                        <h3>{product.name}</h3>
                                        <p className="text-sm opacity-60 line-clamp-1">{product.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-medium">${product.price}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 ghost group-hover:bg-white group-hover:text-black transition-colors">View Details</button>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="cta" id="support">
                <div>
                    <h2>Get the Friday drop list</h2>
                    <p>One email with the best releases, studio notes, and restocks.</p>
                </div>
                <form className="cta-form">
                    <input type="email" placeholder="you@studio.com" />
                    <button type="button" className="primary">Join the list</button>
                </form>
            </section>
        </div>
    )
}

export default Home
