import LeftSectionCRM from "@/components/crm-integration/left-section-crm";
import CRMSetupComplete from "@/components/crm-integration/setup-complete";

const CRMSetupCompletePage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-0 bg-background">
      <LeftSectionCRM currentStep={"Complete setup"} stepNo={3} />
      <CRMSetupComplete />
    </div>
  );
};

export default CRMSetupCompletePage;
