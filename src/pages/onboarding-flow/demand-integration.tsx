import DemandIntegration from "@/components/layout/onboarding-flow/demand-integration";
import LeftSectionWelcome from "@/components/layout/onboarding-flow/left-section-welcome";

const DemandIntegrationPage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWelcome />
      <DemandIntegration />
    </div>
  );
};

export default DemandIntegrationPage;
