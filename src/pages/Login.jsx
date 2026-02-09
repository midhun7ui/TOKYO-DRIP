import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            console.error("Failed to login", error);
        }
    };

    if (currentUser) {
        navigate('/');
        return null;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to access your curated collection.</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="google-btn"
                >
                    <FaGoogle className="icon" />
                    <span>Continue with Google</span>
                </button>

                <div className="login-footer">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
