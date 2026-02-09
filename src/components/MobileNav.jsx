import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Crown, User, Sparkles } from 'lucide-react';
import './MobileNav.css';

const MobileNav = () => {
    return (
        <nav className="mobile-nav">
            <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/collections" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={24} />
                <span>Shop</span>
            </NavLink>
            <NavLink to="/drip-dna" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Sparkles size={24} />
                <span>Drip DNA</span>
            </NavLink>
            <NavLink to="/membership" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Crown size={24} />
                <span>Club</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default MobileNav;
