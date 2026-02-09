import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    // Defensive access to context
    const context = useNotifications();
    const notifications = context?.notifications || [];
    const unreadCount = context?.unreadCount || 0;
    const markAsRead = context?.markAsRead || (() => { });
    const markAllAsRead = context?.markAllAsRead || (() => { });
    const clearAllNotifications = context?.clearAllNotifications || (() => { });

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Debugging
    console.log("NotificationDropdown Rendered. Count:", unreadCount, "Open:", isOpen, "Notifs:", notifications);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (id) => {
        try {
            await markAsRead(id);
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-container" ref={dropdownRef}>
            <button
                className="icon-btn relative notification-trigger"
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="mark-all-btn">
                                    <span>Mark all read</span>
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="clear-all-btn"
                                    title="Clear All Notifications"
                                >
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="notification-list custom-scrollbar">
                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id || Math.random()} // Fallback key
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif.id)}
                                >
                                    {/* Safe Render Function */}
                                    <div className="notification-content">
                                        <div className="notif-icon">
                                            {notif.type === 'price_drop' ? '🏷️' : notif.type === 'order' ? '📦' : '🔔'}
                                        </div>
                                        <div className="notif-text">
                                            <h4>{notif.title || 'Notification'}</h4>
                                            <p>{notif.message || ''}</p>
                                            <span className="notif-time">
                                                {notif.createdAt?.seconds
                                                    ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString()
                                                    : 'Just now'}
                                            </span>
                                            {notif.link && (
                                                <div className="mt-1">
                                                    <Link to={notif.link} className="text-xs text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                                                        View Details
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
