import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLocation } from 'react-router-dom';
import '../App.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        phoneNumber: '+91 ',
        alternativePhoneNumber: '',
        pinCode: '',
        address: '',
        city: ''
    });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);

    // Check for redirect message
    const location = useLocation(); // Make sure to import useLocation
    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
            setIsEditing(true); // Auto-open edit mode if redirected

            // Clear the state so it doesn't persist on refresh/re-nav (optional, but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            age: data.age || '',
                            phoneNumber: data.phoneNumber || '+91 ',
                            alternativePhoneNumber: data.alternativePhoneNumber || '',
                            pinCode: data.pinCode || '',
                            address: data.address || '',
                            city: data.city || ''
                        });
                        // Data exists, so start in locked mode
                        setIsEditing(false);
                    } else {
                        // New profile? Start in edit mode
                        const [first, ...last] = (currentUser.displayName || '').split(' ');
                        setFormData(prev => ({
                            ...prev,
                            firstName: first || '',
                            lastName: last.join(' ') || ''
                        }));
                        setIsEditing(true);
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load profile data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true); // Temporarily show loading
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();

                setFormData(prev => ({
                    ...prev,
                    city: data.city || data.locality || '',
                    pinCode: data.postcode || '',
                    address: `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`
                }));
                setSuccess("Location fetched successfully!");
            } catch (err) {
                console.error("Error fetching location:", err);
                setError("Failed to fetch address details.");
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("Geolocation error:", err);
            setError("Unable to retrieve your location.");
            setLoading(false);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (parseInt(formData.age) < 15) {
            setError("Age must be 15 or older.");
            return;
        }

        if (!formData.pinCode || !formData.address) {
            setError("Pin Code and Address are required.");
            return;
        }

        setSaving(true);
        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                ...formData,
                updatedAt: new Date()
            }, { merge: true });

            setSuccess("Profile updated successfully!");
            setIsEditing(false); // Lock the form after saving
        } catch (err) {
            console.error("Error saving profile:", err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="shell pt-32 text-center">Loading...</div>;

    return (
        <div className="shell pt-28 pb-20">
            <div className="profile-container">
                <header className="profile-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1>Your Profile</h1>
                        <p>Manage your personal information and preferences.</p>
                    </div>
                    <a href="/orders" className="px-6 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 text-sm font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        My Orders
                    </a>
                </header>

                <div className="profile-card">
                    {error && (
                        <div className="status-message error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="status-message success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Jane"
                                    required
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Doe"
                                    required
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="25"
                                required
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Phone Section */}
                        <div className="form-group">
                            <label>Primary Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+91 98765 43210"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>Alternative Phone (Optional)</label>
                            <input
                                type="tel"
                                name="alternativePhoneNumber"
                                value={formData.alternativePhoneNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+1 098 765 4321"
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Address Section */}
                        <div className="mt-6 mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Address Details</h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'rgba(255, 138, 0, 0.1)',
                                        border: '1px solid rgba(255, 138, 0, 0.3)',
                                        color: '#ff8a00',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        marginLeft: 'auto'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 138, 0, 0.2)';
                                        e.target.style.borderColor = '#ff8a00';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(255, 138, 0, 0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 138, 0, 0.1)';
                                        e.target.style.borderColor = 'rgba(255, 138, 0, 0.3)';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    Use Current Location
                                </button>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="123 Fashion St, New York"
                                required
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="New York"
                                    required
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label>Pin Code</label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="10001"
                                    required
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsEditing(true);
                                        setSuccess(''); // Clear success msg when starting edit
                                    }}
                                    className="btn-save"
                                    style={{ backgroundColor: '#444', borderColor: '#555' }} // darker style for edit button
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setError('');
                                            // Ideally reset form data here to original values if cancelled
                                        }}
                                        className="btn-save"
                                        style={{ backgroundColor: 'transparent', border: '1px solid #555', opacity: 0.7, color: '#fff' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-save"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
