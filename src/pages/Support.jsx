import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Search, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const faqTiles = [
    { title: 'Returns & Exchanges', desc: 'Auto-process your return instantly.' },
    { title: 'Shipping Policy', desc: 'Global dispatch times and rates.' },
    { title: 'Product Care', desc: 'Maintenance guides for studio items.' },
    { title: 'Warranty Info', desc: 'Coverage for black label products.' },
];

const Support = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Order Status',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            await addDoc(collection(db, "support_tickets"), {
                ...formData,
                status: 'new',
                createdAt: new Date()
            });
            setStatus('success');
            setFormData({ name: '', email: '', subject: 'Order Status', message: '' });
        } catch (error) {
            console.error("Error submitting ticket:", error);
            setStatus('error');
        }
    };

    return (
        <div className="shell">
            {/* Hero Section */}
            <div className="support-hero">
                <p className="overline">Help Center</p>
                <h1 className="hero-left" style={{ fontSize: '3.5rem', margin: '0.5rem 0' }}>How can we help?</h1>
                <p className="lead" style={{ margin: '0 auto' }}>
                    Search our knowledge base or get in touch with our support team.
                </p>

                <div className="search-bar">
                    <Search className="absolute left-4 top-4 text-white/50" size={20} />
                    <input type="text" placeholder="Search for answers..." className="search-input" />
                </div>
            </div>

            {/* Quick Topics */}
            <section>
                <div className="section-head">
                    <h2>Popular Topics</h2>
                </div>
                <div className="tile-grid">
                    {faqTiles.map((tile, i) => (
                        <div key={i} className="tile-card group cursor-pointer">
                            <h3 className="flex justify-between items-center">
                                {tile.title}
                                <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
                            </h3>
                            <p>{tile.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                {/* Contact Info Side */}
                <div className="contact-info">
                    <div className="section-head">
                        <h2>Get in touch</h2>
                        <p>We usually respond within 2 hours during business days.</p>
                    </div>

                    <div className="info-card">
                        <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">Email Support</h4>
                            <p className="text-sm opacity-60">hello@astracart.com</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">Live Chat</h4>
                            <p className="text-sm opacity-60">Available 9am - 5pm EST</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">Studio HQ</h4>
                            <p className="text-sm opacity-60">1204 Innovation Dr, Tech City</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form Side */}
                <div className="stack-card">
                    <h3 className="mb-6 text-2xl font-display">Send us a message</h3>

                    {status === 'success' ? (
                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
                            <div className="mb-4 inline-flex p-3 rounded-full bg-green-500/20 text-green-500">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                            <p className="opacity-70 mb-6">We've received your request and will get back to you shortly.</p>
                            <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">Send another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block mb-2 text-sm opacity-70">Name</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} type="text" className="form-input" placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label className="block mb-2 text-sm opacity-70">Email</label>
                                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="form-input" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="block mb-2 text-sm opacity-70">Subject</label>
                                <select name="subject" value={formData.subject} onChange={handleChange} className="form-input">
                                    <option>Order Status</option>
                                    <option>Return Request</option>
                                    <option>Product Question</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="block mb-2 text-sm opacity-70">Message</label>
                                <textarea required name="message" value={formData.message} onChange={handleChange} className="form-textarea" placeholder="How can we help?"></textarea>
                            </div>

                            {status === 'error' && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
                                    <AlertCircle size={18} />
                                    <span>Failed to send message. Please try again.</span>
                                </div>
                            )}

                            <button disabled={status === 'submitting'} className="w-full primary flex justify-center items-center gap-2">
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Support;
