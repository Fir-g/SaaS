import IntegrationComplete from "@/components/whatsapp-integration/integration-complete";
import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";

const IntegrationcompletePage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWhatsapp currentStep={"Finish Setting up WhatsApp"} stepNo={4}/>
      <IntegrationComplete />
    </div>
  );
};

export default IntegrationcompletePage;
