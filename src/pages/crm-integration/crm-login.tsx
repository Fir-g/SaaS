import CrmLogin from "@/components/layout/crm-integration/crm-login";
import LeftSectionCRM from "@/components/layout/crm-integration/left-section-crm";

const CRMLoginPage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionCRM stepNo={1} currentStep={"Connect CRM"} />
      <CrmLogin />
    </div>
  );
};

export default CRMLoginPage;
