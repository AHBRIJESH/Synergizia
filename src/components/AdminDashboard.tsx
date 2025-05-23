import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Download, Search, CheckCircle, XCircle, AlertTriangle, Loader, RefreshCw } from "lucide-react";
import { toast } from "./ui/sonner";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RegistrationData } from "@/hooks/useRegistration";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LOCAL_STORAGE_KEY = 'synergizia_registrations';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      // First try to load from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('registrations')
        .select('*')
        .order('registration_date', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (supabaseData && supabaseData.length > 0) {
        // Transform the data to match our application's expected format
        const transformedData = supabaseData.map(reg => {
          return {
            id: reg.id,
            fullName: reg.full_name,
            email: reg.email,
            phone: reg.phone || "",
            college: reg.college || "",
            department: reg.department || "",
            customDepartment: reg.custom_department || "",
            year: reg.year || "",
            selectedEvents: reg.selected_events || [],
            lunchOption: reg.lunch_option || "",
            registrationDate: reg.registration_date || reg.created_at,
            paymentDetails: reg.payment_details || {
              amount: 150,
              lunchOption: reg.lunch_option || "",
              paymentMethod: "on-site",
              paymentStatus: reg.payment_status || "Pending"
            }
          } as RegistrationData;
        });

        setRegistrations(transformedData);
        toast.success(`Loaded ${transformedData.length} registrations from database`);
      } else {
        // Fallback to local storage
        const storedData = localStorage.getItem('synergizia_registrations');
        const data = storedData ? JSON.parse(storedData) : [];
        
        if (data.length > 0) {
          setRegistrations(data);
          toast.info(`Loaded ${data.length} registrations from local storage`);
        } else {
          setRegistrations([]);
          toast.info("No registrations found");
        }
      }
    } catch (error) {
      console.error("Error loading registrations:", error);
      
      // Fallback to local storage
      try {
        const storedData = localStorage.getItem('synergizia_registrations');
        const localData = storedData ? JSON.parse(storedData) : [];
        
        if (localData.length > 0) {
          setRegistrations(localData);
          toast.warning(`Failed to load from database. Using ${localData.length} local registrations`);
        } else {
          toast.error("Failed to load registrations from any source");
        }
      } catch (localError) {
        toast.error("Failed to load registrations");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      registration.fullName.toLowerCase().includes(searchValue) ||
      registration.email.toLowerCase().includes(searchValue) ||
      registration.phone.toLowerCase().includes(searchValue) ||
      registration.college.toLowerCase().includes(searchValue) ||
      registration.id.toLowerCase().includes(searchValue)
    );
  });

  const handleClearRegistrations = async () => {
    try {
      // First remove from database if possible
      const { error } = await supabase
        .from('registrations')
        .delete()
        .neq('id', 'dummy-id'); // Delete all records
      
      if (error) {
        throw error;
      }
      
      // Also clear local storage
      localStorage.removeItem('synergizia_registrations');
      setRegistrations([]);
      toast.success("All registrations have been cleared");
    } catch (error) {
      console.error("Error clearing registrations:", error);
      toast.error("Failed to clear registrations from database");
    }
  };

  const handleExportToCSV = () => {
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "College",
        "Department",
        "Year",
        "Events",
        "Lunch Option",
        "Payment Method",
        "Amount",
        "Payment Status",
        "Transaction ID",
        "Registration Date"
      ];

      const rows = filteredRegistrations.map((reg) => [
        reg.id,
        reg.fullName,
        reg.email,
        reg.phone,
        reg.college,
        reg.department === "other" ? reg.customDepartment : reg.department,
        reg.year,
        reg.selectedEvents.join(", "),
        reg.lunchOption || "None",
        reg.paymentDetails.paymentMethod,
        `₹${reg.paymentDetails.amount}`,
        reg.paymentDetails.paymentStatus,
        reg.paymentDetails.transactionId || "N/A",
        new Date(reg.registrationDate).toLocaleString()
      ]);

      const csvContent =
        headers.join(",") +
        "\n" +
        rows.map((row) => row.map(item => `"${item}"`).join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `synergizia-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };

  const updateRegistrationStatus = async (id: string, status: "Verified" | "Rejected") => {
    setProcessingId(id);
    try {
      // Update in Supabase
      const { error: dbError } = await supabase
        .from('registrations')
        .update({ 
          'payment_status': status.toLowerCase(),
          'payment_details': {
            ...registrations.find(r => r.id === id)?.paymentDetails,
            paymentStatus: status
          }
        })
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }
      
      // Also update in local state
      const updatedRegistrations = registrations.map(reg => {
        if (reg.id === id) {
          return {
            ...reg,
            paymentDetails: {
              ...reg.paymentDetails,
              paymentStatus: status
            }
          };
        }
        return reg;
      });
      
      // Update local storage as well
      localStorage.setItem('synergizia_registrations', JSON.stringify(updatedRegistrations));
      setRegistrations(updatedRegistrations);
      
      toast.success(`Payment ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating payment status:`, error);
      toast.error(`Failed to update payment status`);
    } finally {
      setProcessingId(null);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage event registrations and verify payments
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone or ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportToCSV}
                disabled={filteredRegistrations.length === 0}
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              
              <Button
                variant="outline"
                onClick={loadRegistrations}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={registrations.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all registration data from both the database and local storage. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearRegistrations}>
                      Yes, delete all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm
                ? "No registrations match your search criteria."
                : "No registrations found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  Total of {filteredRegistrations.length} of {registrations.length} registrations
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="min-w-[200px]">Selected Events</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Screenshot</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-mono text-xs">
                        {registration.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {registration.fullName}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.phone}</TableCell>
                      <TableCell>
                        {new Date(registration.registrationDate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex flex-wrap gap-1">
                                {registration.selectedEvents.map((event, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {registration.selectedEvents.map((event, index) => (
                                  <div key={index}>{event}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>₹{registration.paymentDetails.amount}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(registration.paymentDetails.paymentStatus)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {registration.paymentDetails.transactionId || "N/A"}
                      </TableCell>
                      <TableCell>
                        {registration.paymentDetails?.transactionImage ? (
                          <div className="space-y-2">
                            <img 
                              src={registration.paymentDetails.transactionImage} 
                              alt="Payment proof"
                              className="w-20 h-20 object-cover rounded-md cursor-pointer border border-gray-200"
                              onError={(e) => {
                                console.error(`Image failed to load for ${registration.id}:`, e);
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.svg'; // Fallback to a placeholder image
                              }}
                            />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  View Full
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Payment Screenshot</DialogTitle>
                                  <DialogDescription>
                                    Transaction ID: {registration.paymentDetails.transactionId}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                                  <img 
                                    src={registration.paymentDetails.transactionImage} 
                                    alt="Full Payment proof"
                                    className="w-full rounded-lg"
                                    onError={(e) => {
                                      console.error(`Full image failed to load for ${registration.id}:`, e);
                                      const img = e.target as HTMLImageElement;
                                      img.src = '/placeholder.svg'; // Fallback to a placeholder image
                                    }}
                                  />
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.paymentDetails.paymentStatus === "Pending" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={() => updateRegistrationStatus(registration.id, "Verified")}
                              disabled={processingId === registration.id}
                            >
                              {processingId === registration.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )} 
                              Verify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-red-50 hover:bg-red-100 text-red-700"
                              onClick={() => updateRegistrationStatus(registration.id, "Rejected")}
                              disabled={processingId === registration.id}
                            >
                              {processingId === registration.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )} 
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-gray-500">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </p>
          <Button variant="outline" onClick={loadRegistrations}>
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboard;
