import LeftSectionCRM from "@/components/layout/crm-integration/left-section-crm";
import CRMSetupComplete from "@/components/layout/crm-integration/setup-complete";

const CRMSetupCompletePage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionCRM currentStep={"Complete setup"} stepNo={3} />
      <CRMSetupComplete />
    </div>
  );
};

export default CRMSetupCompletePage;
