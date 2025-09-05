import IntegrationComplete from "@/components/whatsapp-integration/integration-complete";
import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";

const IntegrationcompletePage = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-background">
      <LeftSectionWhatsapp currentStep={"Finish Setting up WhatsApp"} stepNo={4}/>
      <div className="flex-1 lg:w-3/4">
        <IntegrationComplete />
      </div>
    </div>
  );
};

export default IntegrationcompletePage;
