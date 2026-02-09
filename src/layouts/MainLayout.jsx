import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationDropdown from '../components/NotificationDropdown';
import MobileNav from '../components/MobileNav'; // Add Import
import { Crown, Star, Shield } from 'lucide-react';

const MainLayout = () => {
    const { currentUser, logout, userProfile } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileMenuRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileMenuOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setProfileMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    // Helper to get membership icon
    const getMembershipIcon = () => {
        if (userProfile?.membershipStatus !== 'active') return null;

        switch (userProfile.membershipPlan) {
            case 'platinum':
                return <Shield size={20} color="#22d3ee" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.8))' }} />;
            case 'gold':
                return <Crown size={20} color="#facc15" style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.8))' }} />;
            case 'silver':
                return <Star size={20} color="#9ca3af" style={{ filter: 'drop-shadow(0 0 8px rgba(156,163,175,0.8))' }} />;
            default: return null;
        }
    };

    return (
        <div className="shell">
            <header className="topbar">
                <div className="brand">
                    <Link to="/" className="flex items-center gap-2 text-inherit no-underline">
                        <span className="brand-mark" />
                        TOKYO DRIP
                    </Link>
                </div>
                <nav className="nav">
                    <Link to="/new-in">New In</Link>
                    <Link to="/collections">Collections</Link>
                    <Link to="/drip-dna" className="text-purple-400">Drip DNA</Link>
                    <Link to="/cart" className="relative flex items-center gap-1">
                        Cart
                        {cartCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-white rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </nav>
                <div className="actions">
                    {/* Search Trigger */}
                    <button
                        className="icon-btn"
                        onClick={() => setSearchOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>

                    {/* Notification Bell */}
                    {currentUser && <NotificationDropdown />}

                    {currentUser ? (
                        <div className="profile-menu-container" ref={profileMenuRef}>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="profile-menu-btn flex items-center gap-3 focus:outline-none"
                            >
                                <div className="flex items-center gap-2">
                                    {getMembershipIcon()}
                                    {currentUser.photoURL ? (
                                        <img
                                            src={currentUser.photoURL}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            className="profile-pic hover:opacity-80 transition-opacity cursor-pointer"
                                            title="Profile"
                                        />
                                    ) : (
                                        <div
                                            className="profile-pic-fallback cursor-pointer"
                                            title="Profile"
                                        >
                                            {currentUser.displayName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileMenuOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <p className="dropdown-user-name">{currentUser.displayName || 'User'}</p>
                                        <p className="dropdown-user-email">{currentUser.email}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/membership"
                                        className="dropdown-item"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Membership
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="dropdown-item"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        to="/shipping"
                                        className="dropdown-item"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Shipping
                                    </Link>
                                    <Link
                                        to="/support"
                                        className="dropdown-item"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Support
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item logout"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login">
                            <button className="primary">Login</button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Full Screen Search Overlay - Moved outside header for better stacking */}
            <div className={`search-overlay ${searchOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={() => setSearchOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <form onSubmit={handleSearchSubmit} className="search-form-overlay">
                    <input
                        type="text"
                        placeholder="WHAT ARE YOU LOOKING FOR?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus={searchOpen}
                    />
                </form>
                <p className="search-hint">PRESS ENTER TO SEARCH</p>
            </div>

            {/* Outlet renders the child route's element (e.g., Home) */}
            <Outlet />

            <footer className="footer pb-24 md:pb-8"> {/* Add padding bottom for mobile nav */}
                <div className="brand">
                    <span className="brand-mark" />
                    TOKYO DRIP
                </div>
                <p>Curated fashion for the modern era.</p>
                <div className="footer-links">
                    <a href="/#newin">New in</a>
                    <a href="/#collections">Collections</a>
                    <Link to="/studios">Studios</Link>
                    <a href="/#support">Support</a>
                </div>
            </footer>

            <MobileNav />
        </div>
    );
};

export default MainLayout;
