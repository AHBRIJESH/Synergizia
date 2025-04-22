
import React from 'react';
import { Button } from '@/components/ui/button';
import { scrollToSection } from '@/lib/scroll';
import AnimationWrapper from './AnimationWrapper';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with electrical and computer science theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 z-0">
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80")'
            }}
          />
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: '1px',
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            ></div>
          ))}
          {[...Array(15)].map((_, i) => (
            <div
              key={`circle-${i}`}
              className="absolute rounded-full border border-white/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 10}px`,
                height: `${Math.random() * 40 + 10}px`,
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-pulse-soft"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDuration: `${Math.random() * 8 + 2}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 z-20">
        <div className="flex flex-col items-center justify-center text-center min-h-screen">
          <AnimationWrapper animation="fade-in" className="text-white max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-black mb-4 text-center font-technofont tracking-wider">
              <span className="text-white">SYNERGIZIA</span>
              <span className="text-synergizia-gold">25</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-light mb-6">
              Technical Symposium
            </h2>
            <p className="text-lg mb-8">
              Hosted by Rajiv Gandhi College of Engineering
              <br />
              <span className="text-synergizia-gold font-semibold">May 15, 2025</span>
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('register')}
                className="bg-synergizia-gold hover:bg-synergizia-gold/90 text-synergizia-purple-dark"
              >
                Register Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => scrollToSection('events')}
                className="border-white text-white hover:bg-white/10"
              >
                Explore Events
              </Button>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
