import React from "react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scroll";
import AnimationWrapper from "./AnimationWrapper";
import { Compass, User2Icon, UserPlus } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Technical EEE and CSE themed background */}
      <div className="absolute inset-0 bg-gradient-to-r from-synergizia-purple-dark to-synergizia-blue z-0">
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          {/* Background image of electrical and computer science components */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=2000&q=80")',
            }}
          />
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/40"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: "1px",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
          {[...Array(20)].map((_, i) => (
            <div
              key={`circuit-${i}`}
              className="absolute rounded-full border border-white/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 50 + 20}px`,
                height: `${Math.random() * 50 + 20}px`,
                borderWidth: "1px",
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Animated technical particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              animationDuration: `${Math.random() * 6 + 2}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 z-20">
        <div className="flex flex-col items-center justify-center text-center min-h-screen">
          <AnimationWrapper
            animation="fade-in"
            className="text-white max-w-3xl"
          >
            <h1 className="font-funky text-4xl md:text-6xl lg:text-8xl text-center text-purple-500 bouncy-text">
              <span className="text-white inline-block whitespace-nowrap">
                SYNERGIZIA
                <span className="text-synergizia-gold">'25</span>
              </span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-light mb-6 tracking-wide">
              Technical Symposium
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Bridging Electrical Electronics & Computer Science Innovation
              <br />
              <span className="text-synergizia-gold font-bold fontsize-80px">
                May 15, 2025
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("register")}
                className="bg-synergizia-gold text-synergizia-purple-dark hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                <UserPlus className="mr-2" />
                Register Now
              </Button>

              <Button
                size="lg"
                onClick={() => scrollToSection("events")}
                className="bg-synergizia-gold text-synergizia-purple-dark hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                <Compass className="mr-2" />
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
