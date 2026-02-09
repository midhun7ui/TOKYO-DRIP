import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { currentUser } = useAuth();

    // TODO: Add actual admin role check here when backend is ready
    // if (!currentUser || !currentUser.isAdmin) {
    //   return <Navigate to="/login" />;
    // }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 text-white bg-gray-900">
                <div className="p-4 font-bold">Admin Panel</div>
                <nav className="flex flex-col p-4">
                    <a href="/admin" className="mb-2 hover:text-gray-300">Dashboard</a>
                    <a href="/admin/products" className="hover:text-gray-300">Products</a>
                </nav>
            </aside>
            <main className="flex-grow p-8 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
