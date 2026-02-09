
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) {
            console.log("NotificationContext: No current user");
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        console.log("NotificationContext: Listening for user:", currentUser.uid);

        // Listen for user-specific notifications and global broadcasts
        // Note: Firestore 'in' query allows up to 10 values.
        // SIMPLIFIED DEBUG QUERY
        // We removed 'ALL' check and 'orderBy' to bypass Index requirements for now.
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid)
            // orderBy('createdAt', 'desc') 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Notification Update:", snapshot.docs.length, "docs");
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            if (error.code === 'failed-precondition') {
                console.error("Firestore Index might be missing. Check console for link.");
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (id) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const batch = writeBatch(db);
            const unreadNotifs = notifications.filter(n => !n.read);

            if (unreadNotifs.length === 0) return;

            unreadNotifs.forEach(n => {
                const notifRef = doc(db, 'notifications', n.id);
                batch.update(notifRef, { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            const batch = writeBatch(db);
            // Only delete notifications that belong specifically to this user
            const userNotifs = notifications.filter(n => n.userId === currentUser.uid);

            if (userNotifs.length === 0) return;

            userNotifs.forEach(n => {
                const notifRef = doc(db, 'notifications', n.id);
                batch.delete(notifRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
