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
  const [connectionState, setConnectionState] = useState<"qr" | "close" | "connecting" | "open">("qr");
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  // Function to create new instance
  const createNewInstance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionState("qr");
      setIsConnected(false);
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
          
          // Update connection state based on API response
          if (state === "qr") {
            setConnectionState("qr");
          } else if (state === "close") {
            setConnectionState("connecting"); // Show connecting when state is "close"
          } else if (state === "connecting") {
            setConnectionState("connecting");
          } else if (state === "open" || state === "connected") {
            setConnectionState("open");
          }
          
          // If connected (state is "open" or "connected"), enable next button and auto-navigate
          if ((state === "open" || state === "connected") && phone) {
            setPhoneNumber(phone);
            setIsConnected(true);
            // Store phone number for later use
            localStorage.setItem("whatsapp_phone_number", phone);
            // Auto-navigate to next step after a short delay
            setTimeout(() => {
              navigate("/whatsapp/team-members");
            }, 2000);
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

    // Check status every 3 seconds for better responsiveness
    const intervalId = setInterval(checkStatus, 3000);
    
    return () => clearInterval(intervalId);
  }, [instanceID, qrCreatedAt, instanceCreatedAt, refreshQr, createNewInstance, getClerkBearer, navigate]);

  const handleManualRefresh = () => {
    refreshQr();
  };

  const handleCreateNew = () => {
    createNewInstance();
  };


  return (
    <div className="flex flex-col h-full py-6 px-4 md:px-4 pt-4">
      <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto w-full">
      <div className="space-y-4">
          <div className="text-gray-800 text-2xl md:text-3xl font-bold items-center">
            Scan the QR code
          </div>
          <div className="text-sm md:text-base text-black-500 bg-gray-50 text-muted-foreground px-4 py-3 rounded-md">
            <strong>Note:</strong> Please use the number where you operate your business and not
            your personal WhatsApp number.
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center ">
          <div className="flex-1 max-w-md space-y-6">
            <div className="space-y-4">
              <p className="text-gray-800 text-xl font-semibold text-center lg:text-left">
                How to connect?
              </p>
              <ol className="list-decimal list-inside space-y-3 text-sm md:text-base text-gray-700">
                <li>Open WhatsApp on your phone</li>
                <li>Go to Settings → Linked Devices</li>
                <li>Tap "Link a Device"</li>
                <li>Point your phone at the QR code</li>
              </ol>
            </div>
            
            
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
            <div className={`border-2 rounded-xl p-6 bg-white shadow-lg transition-all duration-300 ${
              connectionState === "open" ? "border-green-300 shadow-green-100" : 
              (connectionState === "connecting" || connectionState === "close") ? "border-blue-300 shadow-blue-100" : 
              "border-gray-200 shadow-gray-100"
            }`}>
              {loading ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <Loader />
                </div>
              ) : (connectionState === "connecting" || connectionState === "close") ? (
                <div className="relative w-64 h-64">
                  {/* Blurry QR Code */}
                  <img 
                    src={qrImage} 
                    alt="WhatsApp QR Code" 
                    className="w-full h-full object-contain filter blur-sm opacity-40"
                  />
                  {/* Blue connecting circle overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full p-6 shadow-xl">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold text-lg justify-center mr-8">Connecting...</span>
                </div>
              ) : connectionState === "open" ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center bg-green-50 rounded-xl">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-600 font-semibold text-lg">Connected!</span>
                </div>
              ) : qrImage ? (
                <img 
                  src={qrImage} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                  <span className="text-gray-400">QR Code unavailable</span>
                </div>
              )}
            </div>
            
            {connectionState === "qr" && (
              <div className="mt-6 flex flex-col items-center space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Refresh QR
                  </button>
                  <button
                    onClick={handleCreateNew}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    New QR
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center max-w-sm">
                  QR code refreshes automatically every 40 seconds. 
                  If no connection after 3 minutes, a new code will be generated.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <NextButton 
          nextPageUrl="/whatsapp/team-members" 
          text="Next"
          disabled={connectionState !== "open"}
        />
      </div>
    </div>
  );
};

export default ScanQR;