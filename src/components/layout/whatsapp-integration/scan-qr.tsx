import Loader from "@/components/ui/loader";
import NextButton from "@/components/ui/next-button";
import { useAuth } from "@/hooks/useAuth";
import { getQrCode } from "@/services/qrServices";
import { getTenantInstances } from "@/services/storageService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  const [qrImage, setQrImage] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [instanceID, setInstanceID] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();
  console.log(instanceID);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res: any = await getQrCode();
        if (res.success) {
          setQrImage(`${res.qr}`);
        }
        setInstanceID(res.instanceId);
      } catch (err: any) {
        setError(err.message || "Failed to fetch QR code");
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, []);

  // polling to check if user has connected their device

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const poll = async () => {
      try {
        const res = await getTenantInstances("FT");
        const filtered = res.find((r: any) => r.instance_id === instanceID);

        if (filtered) {
          login(filtered[0]);
          clearInterval(intervalId);
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    intervalId = setInterval(poll, 10000);
    return () => clearInterval(intervalId);
  }, [instanceID]);

  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="text-gray-800 text-3xl font-semibold">
            Scan the QR code
          </div>
          <p className="text-l text-black-500 bg-gray-50 text-muted-foreground px-4 py-2 rounded-md">
            Note : Please use the number where you operate your business and not
            your personal whatsapp number.
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <div>
            <p className="text-gray-800 text-l font-semibold pb-4">
              How to scan?
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open the Linked Devices option in your WhatsApp</li>
              <li>Scan the QR code shown on the right</li>
            </ol>
          </div>
          <div className="border rounded-md p-2">
            {/* <div className="h-32 bg-black w-32 p-2"></div> */}

            {loading ? (
              <div className="w-64 h-64 flex items-center justify-center border">
                <span className="text-gray-500">
                  <Loader />
                </span>
              </div>
            ) : (
              <img src={qrImage} alt="QR Code" className="w-64 h-64" />
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
      <NextButton nextPageUrl="./team-members" text="Next" />
    </div>
  );
};

export default ScanQR;
