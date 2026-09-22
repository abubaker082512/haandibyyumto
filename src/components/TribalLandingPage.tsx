import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomerPortal } from './CustomerPortal';
import { MobileCustomerApp } from './MobileCustomerApp';
import { Capacitor } from '@capacitor/core';

export const TribalLandingPage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || Capacitor.isNativePlatform());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768 || Capacitor.isNativePlatform());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExplore = () => {
    setShowMenu(true);
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* FULLSCREEN HERO */}
      <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
        
        {/* Background Image / Video Mock */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.4) contrast(1.2)'
        }} />

        {/* Navbar */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 40px',
          background: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Haandi" style={{ width: '40px', height: '40px', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.1em' }}>HAANDI BY YUMTO</span>
          </div>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em' }}>STORY</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em' }}>GALLERY</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em' }}>LOCATION</a>
            <button onClick={handleExplore} style={{ background: '#E85D04', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.05em' }}>
              ORDER ONLINE
            </button>
          </div>
        </nav>

        {/* Center Content */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px', zIndex: 10
        }}>
          <div style={{ fontSize: '14px', color: '#E85D04', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Traditional Desi Cuisine With A Modern Touch
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '5vw', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '0.05em', lineHeight: 1.1, textTransform: 'uppercase' }}>
            Ancestral Flavors<br/>Reborn
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 40px auto', fontSize: '16px', color: '#ccc', lineHeight: 1.6 }}>
            Experience authentic Charcoal BBQ and hand-crafted Clay Pot Haandi. Premium tribal and cultural cuisine delivered directly to your doorstep in Gulberg Greens.
          </p>

          <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 0' }}>
            <div><div style={{ fontSize: '24px', fontWeight: '900', color: '#E85D04' }}>10+</div><div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Years Heritage</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: '900', color: '#E85D04' }}>50+</div><div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Signature Dishes</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: '900', color: '#E85D04' }}>100%</div><div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Charcoal</div></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div onClick={handleExplore} style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Explore Menu</span>
          <ChevronDown size={24} style={{ animation: 'bounce 2s infinite' }} />
        </div>
      </div>

      {/* DYNAMIC MENU SECTION */}
      {showMenu && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-cream)' }}>
           {isMobile ? <MobileCustomerApp hideHero={true} /> : <CustomerPortal hideHero={true} />}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#0A0A0A', borderTop: '1px solid #222', padding: '60px 40px', textAlign: 'center' }}>
        <img src="/logo.png" alt="Haandi" style={{ width: '60px', height: '60px', filter: 'brightness(0) invert(1)', marginBottom: '20px' }} />
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '30px' }}>
          Civic Center, Executive Block, Gulberg Greens, Islamabad<br/>
          +92-330-0500600
        </div>
        <div style={{ fontSize: '11px', color: '#444' }}>
          © 2026 Haandi by Yumto. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

