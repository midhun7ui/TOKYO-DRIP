import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('astraCart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from local storage", error);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('astraCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
            let newItems;

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
            } else {
                // New item
                newItems = [...prevItems, { ...product, quantity }];
            }
            return newItems;
        });

        // Play Sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); // Calm Ding
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed", e));

        // Custom Toast Notification
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} custom-toast`}
            >
                <div className="toast-content">
                    <div className="flex items-start" style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="toast-image-container">
                            <img
                                className="toast-image"
                                src={product.images?.[0]}
                                alt=""
                            />
                        </div>
                        <div className="toast-text-container">
                            <p className="toast-title">
                                Added to Cart
                            </p>
                            <p className="toast-message">
                                {product.name}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="toast-close-container">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="toast-close-btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'bottom-right' });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotal = cartItems.reduce((acc, item) => {
        const price = item.offerPercentage > 0
            ? item.price - (item.price * (item.offerPercentage / 100))
            : item.price;
        return acc + (price * item.quantity);
    }, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
