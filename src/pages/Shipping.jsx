import React from 'react';
import { Truck, Globe, ShieldCheck, Clock, Package, MapPin } from 'lucide-react';
import '../App.css';

const Shipping = () => {
    return (
        <div className="shell pt-28">
            {/* Hero Section with Animation */}
            <div className="shipping-hero">
                <span className="chip mb-4">Global Logistics</span>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                    From Tokyo to the <span className="text-accent">World</span>
                </h1>
                <p className="text-white/60 max-w-2xl mx-auto mb-12">
                    Premium shipping services tailored for your exclusive streetwear.
                    We ensure your drip arrives safely, no matter where you are.
                </p>

                {/* Animation Track */}
                <div className="shipping-track">
                    <div className="shipping-line"></div>
                    <div className="moving-truck">
                        <Truck size={24} />
                    </div>
                </div>
                <div className="flex justify-between max-w-lg mx-auto text-xs font-mono text-accent opacity-80 mt-2">
                    <span>TOKYO (NRT)</span>
                    <span>IN TRANSIT</span>
                    <span>DELIVERED</span>
                </div>
            </div>

            {/* Shipping Partners Marquee */}
            <div className="mb-16 opacity-70">
                <p className="text-center text-xs tracking-widest uppercase mb-4 opacity-50">Trusted Global Carriers</p>
                <div className="marquee border-none py-2 bg-white/5 backdrop-blur-sm">
                    <div className="track text-lg font-bold">
                        <span className="mx-8">DHL EXPRESS</span>
                        <span className="mx-8">FEDEX</span>
                        <span className="mx-8">UPS</span>
                        <span className="mx-8">YAMATO TRANSPORT</span>
                        <span className="mx-8">USPS</span>
                        <span className="mx-8">ROYAL MAIL</span>
                        <span className="mx-8">CANADAPOST</span>
                        <span className="mx-8">SF EXPRESS</span>
                        {/* Duplicates for seamless loop */}
                        <span className="mx-8">DHL EXPRESS</span>
                        <span className="mx-8">FEDEX</span>
                        <span className="mx-8">UPS</span>
                        <span className="mx-8">YAMATO TRANSPORT</span>
                        <span className="mx-8">USPS</span>
                        <span className="mx-8">ROYAL MAIL</span>
                        <span className="mx-8">CANADAPOST</span>
                        <span className="mx-8">SF EXPRESS</span>
                    </div>
                </div>
            </div>

            {/* Key Features Grid */}
            <div className="shipping-grid">
                <div className="policy-card">
                    <div className="policy-icon">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">24h Dispatch</h3>
                    <p className="text-sm opacity-60">
                        Orders placed before 2 PM JST are dispatched the same day.
                        We operate our urban micro-warehouses 7 days a week.
                    </p>
                </div>

                <div className="policy-card">
                    <div className="policy-icon">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Global Shipping</h3>
                    <p className="text-sm opacity-60">
                        We ship to over 220 countries and territories via DHL Express
                        and FedEx International Priority.
                    </p>
                </div>

                <div className="policy-card">
                    <div className="policy-icon">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Full Insurance</h3>
                    <p className="text-sm opacity-60">
                        Every package is fully insured against loss or damage during transit
                        at no extra cost to you.
                    </p>
                </div>
            </div>

            {/* Detailed Policies */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-display font-bold mb-8">Shipping Policies</h2>

                <div className="policy-details">
                    <div className="detail-item">
                        <h3><Package className="inline mr-2 mb-1" size={18} /> Delivery Times</h3>
                        <p>
                            <strong>North America:</strong> 2-4 Business Days<br />
                            <strong>Europe:</strong> 3-5 Business Days<br />
                            <strong>Asia Pacific:</strong> 1-3 Business Days<br />
                            <strong>Rest of World:</strong> 5-7 Business Days
                        </p>
                    </div>

                    <div className="detail-item">
                        <h3><MapPin className="inline mr-2 mb-1" size={18} /> Duties & Taxes</h3>
                        <p>
                            For most countries, we ship DDP (Delivered Duty Paid), meaning all
                            import taxes and duties are included in the final price. If you are
                            in a DDU (Delivered Duty Unpaid) region, you will be notified at checkout.
                        </p>
                    </div>

                    <div className="detail-item">
                        <h3><Truck className="inline mr-2 mb-1" size={18} /> Tracking Operations</h3>
                        <p>
                            Once your order is dispatched, you will receive a tracking link via email.
                            You can also track your order directly from your account dashboard under
                            "My Orders".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
