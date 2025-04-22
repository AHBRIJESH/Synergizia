import React from 'react';
import AnimationWrapper from './AnimationWrapper';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  time: string;
  events: string[];
  special?: boolean;
}

const schedule: ScheduleItem[] = [
  { time: '9:30 – 10:30 AM', events: ['Paper Presentation', 'JAM'] },
  { time: '10:30 – 11:00 AM', events: ['Beverage Break'], special: true },
  { time: '11:00 – 12:00 PM', events: ['Tech Quiz', 'Snap Expo'] },
  { time: '12:00 – 1:00 PM', events: ['Freq Code', 'Crossing Bridge'] },
  { time: '1:00 – 2:00 PM', events: ['Lunch Break'], special: true },
  { time: '2:00 – 3:00 PM', events: ['Find n Build', 'Luck in Sack'] },
  { time: '3:00 – 3:30 PM', events: ['Prize Distribution'], special: true }
];

const ScheduleSection = () => {
  return (
    <section id="schedule" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <AnimationWrapper>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Event <span className="text-synergizia-purple">Schedule</span></h2>
          <div className="w-20 h-1 bg-synergizia-gold mx-auto mb-6"></div>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Plan your day at SYNERGIZIA25 with our comprehensive event schedule. Note that some events run concurrently.
          </p>
        </AnimationWrapper>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-synergizia-purple via-synergizia-blue to-synergizia-gold"></div>
            
            {schedule.map((item, index) => (
              <AnimationWrapper key={index} delay={index * 150}>
                <div className="relative flex items-start mb-10">
                  {/* Timeline dot */}
                  <div 
                    className={cn(
                      "absolute left-8 w-4 h-4 rounded-full -ml-2 mt-2",
                      "border-4 border-white shadow-md",
                      item.special 
                        ? "bg-synergizia-gold" 
                        : index % 2 === 0 
                          ? "bg-synergizia-purple" 
                          : "bg-synergizia-blue"
                    )}
                  ></div>
                  
                  {/* Time */}
                  <div className="w-40 text-right pr-8 pt-1">
                    <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                      {item.time}
                    </span>
                  </div>
                  
                  {/* Event details */}
                  <div 
                    className={cn(
                      "ml-6 bg-white shadow-sm rounded-lg p-4 flex-grow",
                      "border-l-4",
                      item.special 
                        ? "border-l-synergizia-gold bg-amber-50" 
                        : index % 2 === 0 
                          ? "border-l-synergizia-purple" 
                          : "border-l-synergizia-blue"
                    )}
                  >
                    <div className="flex flex-wrap gap-2">
                      {item.events.map((event, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            item.special 
                              ? "bg-synergizia-gold/10 text-synergizia-gold"
                              : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {event}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
