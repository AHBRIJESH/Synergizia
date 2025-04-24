import React from "react";
import AnimationWrapper from "./AnimationWrapper";
import { Calendar, Check } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <AnimationWrapper>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            About{" "}
            <span className="text-synergizia-purple">
              SYNERGIZIA<span className="text-synergizia-gold">'25</span>
            </span>
          </h2>
          <div className="w-20 h-1 bg-synergizia-gold mx-auto mb-12"></div>
        </AnimationWrapper>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimationWrapper delay={300}>
            <div className="bg-gradient-to-br from-synergizia-purple-light to-synergizia-blue p-1 rounded-lg shadow-lg">
              <div className="bg-white p-6 rounded-lg h-full">
                <h3 className="text-2xl font-semibold mb-4 text-synergizia-purple">
                  Event Overview
                </h3>
                <p className="mb-6 text-gray-700">
                  SYNERGIZIA'25 is a premier technical symposium hosted by Rajiv
                  Gandhi College of Engineering. This event brings together the
                  brightest minds to collaborate, compete, and celebrate
                  technological innovation.
                </p>
                <div className="flex items-center mb-4">
                  <Calendar className="text-synergizia-gold mr-3" />
                  <div>
                    <p className="font-semibold">May 15, 2025</p>
                    <p className="text-sm text-gray-500">9:30 AM - 3:30 PM</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Highlights:</h4>
                  <ul className="space-y-2">
                    {[
                      "Technical & Non-Technical Events",
                      "Networking Opportunities",
                      "Exciting Prizes & Certificates",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1 bg-synergizia-gold/20 p-1 rounded-full">
                          <Check className="h-3 w-3 text-synergizia-gold" />
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimationWrapper>

          <AnimationWrapper delay={600}>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3 text-synergizia-blue">
                  Our Mission
                </h3>
                <p className="text-gray-700">
                  To create a platform where students can showcase their
                  technical skills, exchange ideas, and build valuable
                  connections that will help them in their future endeavors.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3 text-synergizia-blue">
                  About Rajiv Gandhi College of Engineering
                </h3>
                <p className="text-gray-700">
                  Rajiv Gandhi College of Engineering, with 24 years of
                  excellence in technical education and research, is dedicated
                  to nurturing innovation and academic rigor. The college offers
                  a diverse range of courses tailored to meet the evolving needs
                  of industry and society.
                </p>
              </div>

              <div className="bg-synergizia-purple/5 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-synergizia-purple">
                  Join Us
                </h3>
                <p className="text-gray-700">
                  Whether you're a coding enthusiast, a design thinker, or a
                  problem solver, SYNERGIZIA25 has something exciting for you.
                  Register now and be part of this transformative experience!
                </p>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
