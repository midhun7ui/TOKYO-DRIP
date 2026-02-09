import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../App.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ _id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();

            // Subscribe to reviews
            const q = query(collection(db, "products", id, "reviews"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(reviewsData);
            });

            return () => unsubscribe();
        }
    }, [id]);

    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(prev => (prev < 10 ? prev + 1 : 10));
        } else {
            setQuantity(prev => (prev > 1 ? prev - 1 : 1));
        }
    };

    const { addToCart } = useCart();
    const { currentUser, isProfileComplete } = useAuth(); // Destructure isProfileComplete

    const handleAddToCart = () => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/product/${id}` } });
            return;
        }

        if (!isProfileComplete()) {
            navigate('/profile', { state: { message: "Please complete your profile details (Phone, Address) to continue.", from: `/product/${id}` } });
            return;
        }

        if (product) {
            addToCart(product, quantity);
        }
    };

    const handleBuyNow = () => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/product/${id}` } });
            return;
        }

        if (!isProfileComplete()) {
            navigate('/profile', { state: { message: "Please complete your profile details to place an order.", from: `/product/${id}` } });
            return;
        }

        // Pass product directly to checkout without adding to cart
        navigate('/checkout', {
            state: {
                buyNowItem: {
                    ...product,
                    quantity: quantity
                }
            }
        });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please login to write a review.");
            return;
        }
        if (!newReview.trim()) return;

        setSubmittingReview(true);
        try {
            await addDoc(collection(db, "products", id, "reviews"), {
                userId: currentUser.uid,
                userName: currentUser.displayName || "Anonymous",
                rating: reviewRating,
                comment: newReview,
                createdAt: serverTimestamp()
            });
            setNewReview('');
            setReviewRating(5);
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="shell pt-32 text-center">Loading details...</div>;

    if (!product) return (
        <div className="shell pt-32 text-center">
            <h2>Product not found</h2>
            <Link to="/new-in" className="link">Browse other items</Link>
        </div>
    );

    return (
        <div className="shell pt-28 pb-20">
            <div className="product-details-container">
                {/* Left: Gallery */}
                <div className="product-gallery">
                    <div className="main-image-frame relative">
                        {product.images && product.images[activeImage] ? (
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="main-image"
                            />
                        ) : (
                            <div className="no-image-placeholder">No Image</div>
                        )}

                        {product.offerPercentage > 0 && (
                            <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-md">
                                {product.offerPercentage}% OFF
                            </span>
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="thumbnail-row">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`thumbnail-btn ${activeImage === index ? 'active' : ''}`}
                                >
                                    <img src={img} alt={`${product.name} view ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="product-info">
                    <div className="product-header">
                        <span className="chip">{product.category || 'New Arrival'}</span>
                        <h1>{product.name}</h1>
                        <div className="price-container">
                            {product.offerPercentage > 0 ? (
                                <>
                                    <div className="price-row">
                                        <span className="discounted-price">
                                            ${(product.price - (product.price * (product.offerPercentage / 100))).toFixed(2)}
                                        </span>
                                        <span className="original-price">
                                            ${product.price}
                                        </span>
                                    </div>
                                    <div className="badges-row">
                                        <span className="save-badge">
                                            SAVE {product.offerPercentage}%
                                        </span>
                                        <span className="deal-text">
                                            Deal of the day
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="discounted-price" style={{ color: 'white' }}>${product.price}</p>
                            )}
                        </div>
                    </div>

                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description || "No description available for this curated item."}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="product-actions-wrapper">
                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <button onClick={() => handleQuantityChange('decrement')} disabled={quantity <= 1}>-</button>
                            <span className="font-display font-bold text-lg w-8 text-center">{quantity}</span>
                            <button onClick={() => handleQuantityChange('increment')} disabled={quantity >= 10}>+</button>
                        </div>

                        <div className="action-buttons">
                            <button onClick={handleAddToCart} className="btn-cart">Add to Cart</button>
                            <button onClick={handleBuyNow} className="btn-buy-now">Buy Now</button>
                        </div>
                    </div>

                    {/* Shipping & Returns */}
                    <div className="shipping-info">
                        <div className="info-item">
                            <span className="icon">🚚</span>
                            <div>
                                <h4>Free Shipping</h4>
                                <p>On all orders over $200. International shipping available.</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="icon">🛡️</span>
                            <div>
                                <h4>30 Days Return</h4>
                                <p>Easy returns within 30 days of purchase.</p>
                            </div>
                        </div>
                    </div>

                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="label">Collection</span>
                            <span className="value">{(product.collectionTypes || product.collectionType || 'Standard').toString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">SKU</span>
                            <span className="value">{id.substring(0, 8).toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="reviews-section">
                        <h3>Reviews ({reviews.length})</h3>

                        <div className="reviews-list">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <span className="user-name">{review.userName}</span>
                                        <span className="rating">{'★'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="review-text">{review.comment}</p>
                                    <span className="review-date">{review.createdAt?.toDate().toLocaleDateString()}</span>
                                </div>
                            )) : (
                                <p className="no-reviews">No reviews yet. Be the first to review!</p>
                            )}
                        </div>

                        {/* Add Review Form */}
                        {currentUser ? (
                            <form onSubmit={handleSubmitReview} className="add-review-form">
                                <h4>Write a Review</h4>
                                <div className="rating-input">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={star <= reviewRating ? 'active' : ''}
                                        >★</button>
                                    ))}
                                </div>
                                <textarea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    required
                                />
                                <button type="submit" disabled={submittingReview}>
                                    {submittingReview ? 'Posting...' : 'Post Review'}
                                </button>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <Link to="/login">Login</Link> to write a review.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
