
import React, { useState } from "react";
import EventCard, { Event } from "./EventCard";
import AnimationWrapper from "./AnimationWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Calendar,
  Search,
  List,
  User,
  Mail,
  FileText,
  Clock,
  Code,
  Code2,
  Code2Icon,
} from "lucide-react";

const events: Event[] = [
  {
    id: "TECH01",
    title: "Freq Code",
    type: "technical",
    timeSlot: "12:00 – 1:00 PM",
    description:
      "A coding competition designed to test your programming skills and algorithmic thinking under time pressure.",
    icon: <Code2Icon className="text-synergizia-purple" />,
  },
  {
    id: "TECH02",
    title: "Tech Quiz",
    type: "technical",
    timeSlot: "11:00 – 12:00 PM",
    description:
      "Test your knowledge across various domains of technology in this fast-paced quiz competition.",
    icon: <Search className="text-synergizia-purple" />,
  },
  {
    id: "TECH03",
    title: "Find n Build",
    type: "technical",
    timeSlot: "2:00 – 3:00 PM",
    description:
      "Scavenge for components and build a working prototype in this exciting engineering challenge.",
    icon: <Edit className="text-synergizia-purple" />,
  },
  {
    id: "TECH04",
    title: "Paper Presentation (IoT in Smart Cities)",
    type: "technical",
    timeSlot: "9:30 – 10:30 AM",
    description:
      "Present your research papers and innovative ideas on IoT implementation in smart cities to a panel of expert judges and audience.",
    icon: <FileText className="text-synergizia-purple" />,
  },
  {
    id: "NTECH01",
    title: "JAM",
    type: "non-technical",
    timeSlot: "9:30 – 10:30 AM",
    description:
      "  Just A Minute - Showcase your spontaneity and speaking skills in this classic event.",
    icon: <Clock className="text-synergizia-blue" />,
  },
  {
    id: "NTECH02",
    title: "Snap Expo",
    type: "non-technical",
    timeSlot: "11:00 – 12:00 PM",
    description:
      "A photography competition that challenges your creative eye and storytelling abilities.",
    icon: <Mail className="text-synergizia-blue" />,
  },
  {
    id: "NTECH03",
    title: "Crossing Bridge",
    type: "non-technical",
    timeSlot: "12:00 – 1:00 PM",
    description:
      "A team-based problem-solving event that tests your coordination and strategic thinking.",
    icon: <User className="text-synergizia-blue" />,
  },
  {
    id: "NTECH04",
    title: "Luck in Sack",
    type: "non-technical",
    timeSlot: "2:00 – 3:00 PM",
    description:
      "A fun-filled event that combines luck with quick thinking and adaptability.",
    icon: <List className="text-synergizia-blue" />, // Added an icon here
  },
];

const EventsSection = () => {
  const [filter, setFilter] = useState<"all" | "technical" | "non-technical">(
    "all"
  );

  const filteredEvents = events.filter((event) =>
    filter === "all" ? true : event.type === filter
  );

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <AnimationWrapper>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Our <span className="text-synergizia-purple">Events</span>
          </h2>
          <div className="w-20 h-1 bg-synergizia-gold mx-auto mb-6"></div>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Participate in our exciting range of technical and non-technical
            events designed to challenge your skills and showcase your talents.
          </p>
        </AnimationWrapper>

        <Tabs defaultValue="all" className="mb-12">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              All Events
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              onClick={() => setFilter("technical")}
            >
              Technical
            </TabsTrigger>
            <TabsTrigger
              value="non-technical"
              onClick={() => setFilter("non-technical")}
            >
              Non-Technical
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="non-technical" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default EventsSection;
