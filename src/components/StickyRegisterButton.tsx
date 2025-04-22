
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { scrollToSection } from '@/lib/scroll';

const StickyRegisterButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled past 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <Button
        onClick={() => scrollToSection('register')}
        className="bg-synergizia-gold hover:bg-synergizia-gold/90 text-synergizia-purple font-bold px-6 py-5 rounded-full shadow-lg"
      >
        Register Now
      </Button>
    </div>
  );
};

export default StickyRegisterButton;
