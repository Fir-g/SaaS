import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api/api";
import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

export const AlreadyLoggedInModal: React.FC = () => {
  const { logout, instanceId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/whatsapp");
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const getContactNumber = async () => {
      try {
        const response = await api.get("sqldb/instances/FT/tenant-instances");
        console.log(
          response.data.filter((res: any) => res.instance_id === instanceId)
        );
        console.log(instanceId, response.data);
        // return response.data;
      } catch (error) {
        console.error("Error in service:", error);
        throw new Error("Failed to fetch contacts");
      }
    };
    getContactNumber();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Already Logged In
            </h2>
            {/* <p className="text-gray-600 mb-4">
              You're already authenticated with instance ID:
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-2 block">
                {instanceId}
              </span>
            </p> */}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-md "
            >
              Logout & Show QR
            </Button>
            <Button
              onClick={handleContinue}
              className="w-full  py-2 px-4 rounded-md"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
