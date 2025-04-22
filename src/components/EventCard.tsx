
import React from 'react';
import { Card } from '@/components/ui/card';
import AnimationWrapper from './AnimationWrapper';
import { cn } from '@/lib/utils';

export interface Event {
  id: string;
  title: string;
  type: 'technical' | 'non-technical';
  timeSlot: string;
  description: string;
  icon: React.ReactNode;
}

interface EventCardProps {
  event: Event;
  index: number;
  className?: string;
}

const EventCard = ({ event, index, className }: EventCardProps) => {
  return (
    <AnimationWrapper delay={index * 200} className={className}>
      <Card className={cn(
        "h-full overflow-hidden group transition-all duration-300 hover:shadow-lg relative",
        "border-2 hover:border-synergizia-purple",
        "flex flex-col"
      )}>
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-synergizia-purple/5 to-synergizia-blue/5"
        )} />
        
        <div className="p-6 flex flex-col h-full">
          <div className="mb-4 text-synergizia-purple flex justify-between items-center">
            <div className="text-4xl">{event.icon}</div>
            <span className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full",
              event.type === 'technical' 
                ? "bg-synergizia-purple/10 text-synergizia-purple" 
                : "bg-synergizia-blue/10 text-synergizia-blue"
            )}>
              {event.type === 'technical' ? 'Technical' : 'Non-Technical'}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-synergizia-purple transition-colors">
            {event.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2">{event.timeSlot}</p>
          
          <p className="text-gray-600 text-sm flex-grow">{event.description}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Event ID: {event.id}</span>
          </div>
        </div>
      </Card>
    </AnimationWrapper>
  );
};

export default EventCard;
