import Loader from "@/components/ui/loader";
import NextButton from "@/components/ui/next-button";
import { getQrCode, getInstanceStatus, refreshQrCode } from "@/services/qrServices";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const ScanQR = () => {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [qrImage, setQrImage] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [instanceID, setInstanceID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [instanceCreatedAt, setInstanceCreatedAt] = useState<number>(0);
  const [qrCreatedAt, setQrCreatedAt] = useState<number>(0);
  const navigate = useNavigate();

  // Function to create new instance
  const createNewInstance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkBearer();
      const res: any = await getQrCode(token);
      if (res.success) {
        setQrImage(res.qr);
        setInstanceID(res.instanceId);
        setInstanceCreatedAt(Date.now());
        setQrCreatedAt(Date.now());
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch QR code");
    } finally {
      setLoading(false);
    }
  }, [getClerkBearer]);

  // Function to refresh QR code
  const refreshQr = useCallback(async () => {
    if (!instanceID) return;
    try {
      const token = await getClerkBearer();
      const res = await refreshQrCode(instanceID, token);
      if (res.success) {
        setQrImage(res.qr);
        setQrCreatedAt(Date.now());
      }
    } catch (err: any) {
      console.error("Failed to refresh QR:", err);
      setError(err.message || "Failed to refresh QR code");
    }
  }, [instanceID, getClerkBearer]);

  // Initial QR fetch
  useEffect(() => {
    createNewInstance();
  }, [createNewInstance]);

  // Status checking and QR management
  useEffect(() => {
    if (!instanceID) return;

    const checkStatus = async () => {
      try {
        const token = await getClerkBearer();
        const status = await getInstanceStatus(instanceID, token);
        
        if (status.success && status.instance) {
          const { state, phoneNumber: phone, lastActivity, createdAt } = status.instance;
          
          // If connected, navigate to next step
          if (state === "connected" || phone) {
            setPhoneNumber(phone);
            // Store phone number for later use
            localStorage.setItem("whatsapp_phone_number", phone);
            navigate("/whatsapp/team-members");
            return;
          }

          // Handle QR refresh logic
          if (state === "qr") {
            const now = Date.now();
            const qrAge = now - qrCreatedAt;
            const instanceAge = now - instanceCreatedAt;

            // If QR is older than 40 seconds, refresh it
            if (qrAge >= 40000) {
              await refreshQr();
            }
            
            // If instance is older than 3 minutes, create new instance
            if (instanceAge >= 180000) {
              await createNewInstance();
            }
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    };

    // Check status every 5 seconds
    const intervalId = setInterval(checkStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [instanceID, qrCreatedAt, instanceCreatedAt, refreshQr, createNewInstance, getClerkBearer, navigate]);

  const handleManualRefresh = () => {
    refreshQr();
  };

  const handleCreateNew = () => {
    createNewInstance();
  };

  return (
    <div className="flex flex-col h-full py-6 px-4 md:px-12 pt-20">
      <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto w-full">
        <div className="space-y-4">
          <div className="text-gray-800 text-2xl md:text-3xl font-semibold">
            Scan the QR code
          </div>
          <div className="text-sm md:text-base text-black-500 bg-gray-50 text-muted-foreground px-4 py-3 rounded-md">
            <strong>Note:</strong> Please use the number where you operate your business and not
            your personal WhatsApp number.
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1 space-y-4">
            <p className="text-gray-800 text-base md:text-lg font-semibold">
              How to scan?
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Point your phone at the QR code shown on the right</li>
            </ol>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleManualRefresh}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Refresh QR
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Create New
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              {loading ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <Loader />
                </div>
              ) : qrImage ? (
                <img 
                  src={qrImage} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded">
                  <span className="text-gray-400">QR Code unavailable</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                New QR
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
              QR code refreshes automatically every 40 seconds. 
              If no connection after 3 minutes, a new code will be generated.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <NextButton 
          nextPageUrl="/whatsapp/team-members" 
          text="Skip for now"
        />
      </div>
    </div>
  );
};

export default ScanQR;