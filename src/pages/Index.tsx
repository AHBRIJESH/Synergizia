
import React, { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import EventsSection from '@/components/EventsSection';
import ScheduleSection from '@/components/ScheduleSection';
import RegistrationForm from '@/components/RegistrationForm';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import StickyRegisterButton from '@/components/StickyRegisterButton';
import { initAnimateOnScroll } from '@/lib/scroll';

const Index = () => {
  useEffect(() => {
    // Initialize animations on scroll
    initAnimateOnScroll();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <EventsSection />
      <ScheduleSection />
      <RegistrationForm />
      <Footer />
      <StickyRegisterButton />
    </div>
  );
};

export default Index;
