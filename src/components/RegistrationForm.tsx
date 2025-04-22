
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from './EventCard';

interface TimeSlot {
  time: string;
  events: Event[];
}

// Example event data structure with full details
const events: Event[] = [
  {
    id: 'TECH01',
    title: 'Freq Code',
    type: 'technical',
    timeSlot: '12:00 – 1:00 PM',
    description: 'A coding competition designed to test your programming skills and algorithmic thinking under time pressure.',
    icon: null
  },
  {
    id: 'TECH02',
    title: 'Tech Quiz',
    type: 'technical',
    timeSlot: '11:00 – 12:00 PM',
    description: 'Test your knowledge across various domains of technology in this fast-paced quiz competition.',
    icon: null
  },
  {
    id: 'TECH03',
    title: 'Find n Build',
    type: 'technical',
    timeSlot: '2:00 – 3:00 PM',
    description: 'Scavenge for components and build a working prototype in this exciting engineering challenge.',
    icon: null
  },
  {
    id: 'TECH04',
    title: 'Paper Presentation',
    type: 'technical',
    timeSlot: '9:30 – 10:30 AM',
    description: 'Present your research papers and innovative ideas to a panel of expert judges and audience.',
    icon: null
  },
  {
    id: 'NTECH01',
    title: 'JAM',
    type: 'non-technical',
    timeSlot: '9:30 – 10:30 AM',
    description: 'Just A Minute - Showcase your spontaneity and speaking skills in this classic event.',
    icon: null
  },
  {
    id: 'NTECH02',
    title: 'Snap Expo',
    type: 'non-technical',
    timeSlot: '11:00 – 12:00 PM',
    description: 'A photography competition that challenges your creative eye and storytelling abilities.',
    icon: null
  },
  {
    id: 'NTECH03',
    title: 'Crossing Bridge',
    type: 'non-technical',
    timeSlot: '12:00 – 1:00 PM',
    description: 'A team-based problem-solving event that tests your coordination and strategic thinking.',
    icon: null
  },
  {
    id: 'NTECH04',
    title: 'Luck in Sack',
    type: 'non-technical',
    timeSlot: '2:00 – 3:00 PM',
    description: 'A fun-filled event that combines luck with quick thinking and adaptability.',
    icon: null
  }
];

// Organize events by time slots
const timeSlots: Record<string, string[]> = {
  '9:30 – 10:30 AM': ['Paper Presentation', 'JAM'],
  '11:00 – 12:00 PM': ['Tech Quiz', 'Snap Expo'],
  '12:00 – 1:00 PM': ['Freq Code', 'Crossing Bridge'],
  '2:00 – 3:00 PM': ['Find n Build', 'Luck in Sack']
};

interface FormData {
  fullName: string;
  college: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  selectedEvents: string[];
}

const initialForm: FormData = {
  fullName: '',
  college: '',
  department: '',
  year: '',
  email: '',
  phone: '',
  selectedEvents: []
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (eventTitle: string, checked: boolean) => {
    // Find the time slot for this event
    let eventTimeSlot = '';
    for (const [time, eventNames] of Object.entries(timeSlots)) {
      if (eventNames.includes(eventTitle)) {
        eventTimeSlot = time;
        break;
      }
    }

    if (checked) {
      // Add this event
      setFormData(prev => ({
        ...prev,
        selectedEvents: [...prev.selectedEvents, eventTitle]
      }));
    } else {
      // Remove this event
      setFormData(prev => ({
        ...prev,
        selectedEvents: prev.selectedEvents.filter(event => event !== eventTitle)
      }));
    }
  };

  // Check if an event should be disabled due to conflicts
  const isEventDisabled = (eventTitle: string): boolean => {
    // If no events selected, nothing is disabled
    if (formData.selectedEvents.length === 0) return false;

    // Find the time slot for this event
    let eventTimeSlot = '';
    for (const [time, eventNames] of Object.entries(timeSlots)) {
      if (eventNames.includes(eventTitle)) {
        eventTimeSlot = time;
        break;
      }
    }

    // Check if user already has an event in this time slot
    for (const selectedEvent of formData.selectedEvents) {
      // Skip if it's the current event (already selected)
      if (selectedEvent === eventTitle) return false;

      // Check if any selected event is in the same time slot
      for (const [time, eventNames] of Object.entries(timeSlots)) {
        if (time === eventTimeSlot && eventNames.includes(selectedEvent)) {
          return true; // Conflict found
        }
      }
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate a server request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success response
      toast({
        title: "Registration Successful!",
        description: "You have successfully registered for SYNERGIZIA25.",
        variant: "default",
      });
      
      // Clear the form
      setFormData(initialForm);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error with your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Register <span className="text-synergizia-purple">Now</span></h2>
        <div className="w-20 h-1 bg-synergizia-gold mx-auto mb-6"></div>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Secure your spot at SYNERGIZIA25 by filling out the registration form below. Please note that you cannot register for events happening at the same time.
        </p>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Event Registration</CardTitle>
            <CardDescription>
              Fill in your details to register for the symposium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="college">College Name</Label>
                    <Input 
                      id="college" 
                      name="college"
                      value={formData.college}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={formData.department}
                      onValueChange={(value) => handleSelectChange("department", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="computer_science">Computer Science</SelectItem>
                          <SelectItem value="information_technology">Information Technology</SelectItem>
                          <SelectItem value="electronics">Electronics & Communication</SelectItem>
                          <SelectItem value="electrical">Electrical Engineering</SelectItem>
                          <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                          <SelectItem value="civil">Civil Engineering</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Select 
                      value={formData.year}
                      onValueChange={(value) => handleSelectChange("year", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1">First Year</SelectItem>
                          <SelectItem value="2">Second Year</SelectItem>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                          <SelectItem value="pg">Postgraduate</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact and Event Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Select Events</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(timeSlots).map(([time, eventNames]) => (
                        <div key={time} className="space-y-2">
                          <div className="text-sm font-medium text-gray-500">{time}</div>
                          <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                            {eventNames.map(name => {
                              const isSelected = formData.selectedEvents.includes(name);
                              const isDisabled = !isSelected && isEventDisabled(name);
                              
                              return (
                                <div key={name} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`event-${name}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      handleEventChange(name, checked === true);
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
                    {formData.selectedEvents.length === 0 && (
                      <p className="text-sm text-red-500">Please select at least one event.</p>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-synergizia-purple hover:bg-synergizia-purple-dark"
                disabled={isSubmitting || formData.selectedEvents.length === 0}
              >
                {isSubmitting ? "Registering..." : "Register Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegistrationForm;
