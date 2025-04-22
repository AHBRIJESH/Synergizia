
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, LogOut } from 'lucide-react';

// Sample registration data
const sampleRegistrations = [
  { id: 1, name: 'John Doe', college: 'MIT College', department: 'Computer Science', year: '3', email: 'john@example.com', phone: '9876543210', events: ['Freq Code', 'Find n Build'] },
  { id: 2, name: 'Jane Smith', college: 'Stanford University', department: 'Information Technology', year: '2', email: 'jane@example.com', phone: '8765432109', events: ['Tech Quiz', 'Luck in Sack'] },
  { id: 3, name: 'Alex Johnson', college: 'Harvard University', department: 'Electronics', year: '4', email: 'alex@example.com', phone: '7654321098', events: ['Paper Presentation', 'Crossing Bridge'] },
  { id: 4, name: 'Sarah Williams', college: 'Caltech', department: 'Electrical Engineering', year: '1', email: 'sarah@example.com', phone: '6543210987', events: ['JAM', 'Snap Expo'] },
  { id: 5, name: 'Michael Brown', college: 'Princeton University', department: 'Mechanical Engineering', year: 'pg', email: 'michael@example.com', phone: '5432109876', events: ['Paper Presentation', 'Tech Quiz'] },
];

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [registrations, setRegistrations] = useState(sampleRegistrations);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setRegistrations(sampleRegistrations);
      return;
    }
    
    const filtered = sampleRegistrations.filter(reg => 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.events.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setRegistrations(filtered);
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'College', 'Department', 'Year', 'Email', 'Phone', 'Events'];
    
    const rows = registrations.map(reg => [
      reg.id,
      reg.name,
      reg.college,
      reg.department,
      reg.year,
      reg.email,
      reg.phone,
      reg.events.join(', ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'synergizia25_registrations.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDepartmentName = (code: string): string => {
    const departments: Record<string, string> = {
      'computer_science': 'Computer Science',
      'information_technology': 'Information Technology',
      'electronics': 'Electronics & Communication',
      'electrical': 'Electrical Engineering',
      'mechanical': 'Mechanical Engineering',
      'civil': 'Civil Engineering',
      'other': 'Other'
    };
    
    return departments[code] || code;
  };

  const getYearName = (code: string): string => {
    const years: Record<string, string> = {
      '1': 'First Year',
      '2': 'Second Year',
      '3': 'Third Year',
      '4': 'Fourth Year',
      'pg': 'Postgraduate'
    };
    
    return years[code] || code;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-synergizia-purple">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">SYNERGIZIA25 Event Management</p>
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
              
              <Button onClick={handleDownloadCSV} className="bg-synergizia-blue hover:bg-synergizia-blue-dark">
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
                {registrations.length > 0 ? (
                  registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.id}</TableCell>
                      <TableCell className="font-medium">{reg.name}</TableCell>
                      <TableCell>{reg.college}</TableCell>
                      <TableCell>{getDepartmentName(reg.department)}</TableCell>
                      <TableCell>{getYearName(reg.year)}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {reg.events.map((event, index) => (
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
