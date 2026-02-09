import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { currentUser, isProfileComplete } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));

                const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

                const filtered = productsData.filter(product => {
                    const name = (product.name || '').toLowerCase();
                    const category = (product.category || '').toLowerCase();
                    const desc = (product.description || '').toLowerCase();

                    // Check if *every* search term is present in at least one field
                    // This allows for "black shirt" to match "Black Cotton Shirt"
                    return searchTerms.every(term =>
                        name.includes(term) ||
                        category.includes(term) ||
                        desc.includes(term)
                    );
                });

                setProducts(filtered);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

    const handleAddToCart = (e, product) => {
        e.preventDefault(); // Prevent navigation if clicking button inside Link
        if (!currentUser) {
            navigate('/login', { state: { from: `/search?q=${query}` } });
            return;
        }

        if (!isProfileComplete()) {
            // Redirect to profile specifically, overriding the default behavior
            navigate('/profile', { state: { message: "Please complete your profile to add items to cart.", from: `/search?q=${query}` } });
            return;
        }

        addToCart(product);
    };

    return (
        <div className="shell pt-28">
            <div className="section-head">
                <h2>Search Results</h2>
                <p>Showing results for "{query}"</p>
            </div>

            <div className="featured-grid">
                {loading ? (
                    <p>Searching archives...</p>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-20 opacity-60">
                        <p>No matches found for "{query}".</p>
                        <p className="text-sm mt-2">Try checking your spelling or using different keywords.</p>
                    </div>
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
                                    <span className="absolute top-2 left-2 chip">{product.category || 'Item'}</span>
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
                                <button
                                    className="w-full mt-4 ghost group-hover:bg-white group-hover:text-black transition-colors"
                                    onClick={(e) => handleAddToCart(e, product)}
                                >
                                    Add to cart
                                </button>
                            </article>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Search;
