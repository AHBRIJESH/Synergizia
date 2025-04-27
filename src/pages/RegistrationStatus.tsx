
import React, { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const RegistrationStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registrationId, email, message } = location.state || {};

  useEffect(() => {
    // Redirect to home page after 15 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 15000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  if (!registrationId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-center">Registration Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for registering for SYNERGIZIA25
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500 mt-4">
                  You will be redirected to the home page in 15 seconds...
                </p>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  Registration ID: <span className="font-mono">{registrationId}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Confirmation will be sent to: <span className="font-medium">{email}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationStatus;
