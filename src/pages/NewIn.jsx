import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import query, where
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';

const NewIn = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch ALL products first to allow client-side array filtering
                const querySnapshot = await getDocs(collection(db, "products"));

                const productsData = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }))
                    .filter(p => {
                        // Check array (new way) OR string (old way)
                        const types = p.collectionTypes || [];
                        return types.includes('new-in') || p.collectionType === 'new-in';
                    });

                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // ... return logic remains same ...
    return (
        <div className="shell">
            <div className="section-head">
                <h2>New Arrivals</h2>
                <p>Fresh drops from our studio partners.</p>
            </div>

            <div className="featured-grid">
                {loading ? (
                    <p>Loading inventory...</p>
                ) : products.length === 0 ? (
                    <p className="opacity-60 text-center py-12 border border-dashed rounded-xl border-white/10">
                        No items in "New In" yet. <br />
                        <span className="text-sm">Move items here via Admin Dashboard.</span>
                    </p>
                ) : (
                    products.map((product) => (
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
                    ))
                )}
            </div>
        </div>
    );
};

export default NewIn;
