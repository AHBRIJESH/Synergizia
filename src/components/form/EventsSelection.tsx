
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EventsSelectionProps {
  selectedEvents: string[];
  onEventChange: (eventName: string, checked: boolean) => void;
  timeSlots: Record<string, string[]>;
  isEventDisabled: (eventName: string) => boolean;
}

const EventsSelection: React.FC<EventsSelectionProps> = ({
  selectedEvents,
  onEventChange,
  timeSlots,
  isEventDisabled
}) => {
  return (
    <div className="space-y-3">
      <Label>Select Events *</Label>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(timeSlots).map(([time, eventNames]) => (
          <div key={time} className="space-y-2">
            <div className="text-sm font-medium text-gray-500">
              {time}
            </div>
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
              {eventNames.map((name) => {
                const isSelected = selectedEvents.includes(name);
                const isDisabled = !isSelected && isEventDisabled(name);

                return (
                  <div
                    key={name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`event-${name}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        onEventChange(name, checked === true);
                      }}
                      disabled={isDisabled}
                    />
                    <Label
                      htmlFor={`event-${name}`}
                      className={isDisabled ? "text-gray-400" : ""}
                    >
                      {name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {selectedEvents.length === 0 && (
        <p className="text-sm text-red-500">
          Please select at least one event.
        </p>
      )}
    </div>
  );
};

export default EventsSelection;
