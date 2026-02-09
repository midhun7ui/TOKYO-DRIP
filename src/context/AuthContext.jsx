import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // Firestore Data
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); // 'user' or 'admin'

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                setCurrentUser(user);

                // Fetch User Role (Legacy/Backend)
                try {
                    const token = await user.getIdToken();
                    // We can keep the fetch if needed, or rely on Firestore claims/document
                    // For now, let's keep the user object clean
                } catch (error) {
                    console.error("Token error:", error);
                }

            } else {
                // User is signed out
                setCurrentUser(null);
                setUserProfile(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Separate Effect to listen to Firestore Profile Changes
    useEffect(() => {
        let unsubscribeProfile = () => { };

        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserProfile(doc.data());
                    // Optional: Set Role from Firestore if it exists there
                    if (doc.data().role) setUserRole(doc.data().role);
                } else {
                    setUserProfile(null);
                }
            }, (error) => {
                console.error("Error fetching user profile:", error);
            });
        }

        return () => unsubscribeProfile();
    }, [currentUser]);

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        return signOut(auth);
    };

    const isProfileComplete = () => {
        if (!userProfile) return false;
        const required = ['phoneNumber', 'address', 'pinCode', 'city'];
        const missing = required.filter(field => !userProfile[field] || userProfile[field].trim() === '');
        return missing.length === 0;
    };

    const value = {
        currentUser,
        userProfile,
        userRole,
        isProfileComplete,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
