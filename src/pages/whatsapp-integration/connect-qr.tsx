import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";
import ScanQR from "@/components/whatsapp-integration/scan-qr";

const ConnectQR = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWhatsapp currentStep={"Connect to WhatsApp"}  stepNo={1}/>
      <ScanQR />
    </div>
  );
};

export default ConnectQR;
