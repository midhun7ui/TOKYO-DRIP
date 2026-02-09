import React from 'react';

const brands = [
    "AESTHETIX", "VOID WEAR", "NOCTURNAL", "ECHO LABS", "FLUX",
    "URBAN PULSE", "NEON VOID", "AETHER", "ZENITH", "VANGUARD",
    "OMEGA STYLE", "PRISM", "QUANTUM", "VELOCITY", "HORIZON",
    "APEX", "ECLIPSE", "SOLARIS", "LUMINA", "VORTEX",
    "GRAVITY", "PULSAR", "QUASAR", "NEBULA", "COSMOS",
    "STARDUST", "ORBIT", "GALAXY", "INFINITY", "DIMENSION"
];

const Studios = () => {
    return (
        <div className="shell pt-32 pb-20">
            <div className="text-center mb-16">
                <h1 className="glowing-text">The Collective</h1>
                <p className="opacity-60 max-w-md mx-auto">
                    uniting the world's most visionary designers to define the future of fashion.
                </p>
            </div>

            <div className="studios-container">
                {/* Row 1 - Scroll Left */}
                <div className="marquee-row">
                    <div className="marquee-content scroll-left">
                        {brands.map((brand, i) => (
                            <span key={`r1-${i}`} className="studio-brand">{brand}</span>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {brands.map((brand, i) => (
                            <span key={`r1-dup-${i}`} className="studio-brand">{brand}</span>
                        ))}
                    </div>
                </div>

                {/* Row 2 - Scroll Right */}
                <div className="marquee-row">
                    <div className="marquee-content scroll-right">
                        {brands.slice().reverse().map((brand, i) => (
                            <span key={`r2-${i}`} className="studio-brand stroked">{brand}</span>
                        ))}
                        {brands.slice().reverse().map((brand, i) => (
                            <span key={`r2-dup-${i}`} className="studio-brand stroked">{brand}</span>
                        ))}
                    </div>
                </div>

                {/* Row 3 - Scroll Left (Slower) */}
                <div className="marquee-row">
                    <div className="marquee-content scroll-left-slow">
                        {brands.map((brand, i) => (
                            <span key={`r3-${i}`} className="studio-brand opacity-50">{brand}</span>
                        ))}
                        {brands.map((brand, i) => (
                            <span key={`r3-dup-${i}`} className="studio-brand opacity-50">{brand}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center mt-20">
                <p className="text-sm opacity-40 uppercase tracking-widest">Join the collective</p>
                <a href="mailto:partners@astracart.com" className="inline-block mt-4 border-b border-white pb-1 hover:text-accent hover:border-accent transition-colors">Apply for partnership</a>
            </div>
        </div>
    );
};

export default Studios;
