import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, LogOut } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Shared local storage key with registration form
const LOCAL_STORAGE_KEY = "synergizia_registrations";

interface Registration {
  id: string;
  fullName: string;
  college: string;
  department: string;
  customDepartment?: string;
  year: string;
  email: string;
  phone: string;
  selectedEvents: string[];
  registrationDate: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);

  // Load registrations from localStorage on component mount
  useEffect(() => {
    const loadRegistrations = () => {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        const savedRegistrations = data ? JSON.parse(data) : [];
        setRegistrations(savedRegistrations);
        setFilteredRegistrations(savedRegistrations);

        if (savedRegistrations.length > 0) {
          toast.success("Registrations loaded", {
            description: `${savedRegistrations.length} registrations found`,
          });
        }
      } catch (error) {
        console.error("Error loading registrations:", error);
        toast.error("Error loading registrations", {
          description: "Failed to load registration data",
        });
      }
    };

    loadRegistrations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }

    const filtered = registrations.filter(
      (reg) =>
        reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.includes(searchTerm) ||
        reg.selectedEvents?.some((event) =>
          event.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    setFilteredRegistrations(filtered);
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Name",
      "College",
      "Department",
      "Year",
      "Email",
      "Phone",
      "Events",
      "Registration Date",
    ];

    const rows = filteredRegistrations.map((reg) => [
      reg.id,
      reg.fullName,
      reg.college,
      getDepartmentName(reg.department),
      getYearName(reg.year),
      reg.email,
      reg.phone,
      reg.selectedEvents.join(", "),
      new Date(reg.registrationDate).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "synergizia25_registrations.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDepartmentName = (code: string): string => {
    const departments: Record<string, string> = {
      computer_science: "Computer Science",
      information_technology: "Information Technology",
      electronics: "Electronics & Communication",
      electrical: "Electrical Engineering",
      mechanical: "Mechanical Engineering",
      civil: "Civil Engineering",
      other: "Other",
    };

    return departments[code] || code;
  };

  const getYearName = (code: string): string => {
    const years: Record<string, string> = {
      "1": "First Year",
      "2": "Second Year",
      "3": "Third Year",
      "4": "Fourth Year",
      pg: "Postgraduate",
    };

    return years[code] || code;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-synergizia-purple">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              SYNERGIZIA25 Event Management
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-semibold">Registration Entries</h2>
              <p className="text-gray-500">View and manage all registrations</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Button
                onClick={handleDownloadCSV}
                className="bg-synergizia-blue hover:bg-synergizia-blue-dark"
                disabled={filteredRegistrations.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>List of all participant registrations</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.id}</TableCell>
                      <TableCell className="font-medium">
                        {reg.fullName}
                      </TableCell>
                      <TableCell>{reg.college}</TableCell>
                      <TableCell>{getDepartmentName(reg.department)}</TableCell>
                      <TableCell>{getYearName(reg.year)}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {reg.selectedEvents.map((event, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-synergizia-purple/10 text-synergizia-purple text-xs rounded-full"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No registrations found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
