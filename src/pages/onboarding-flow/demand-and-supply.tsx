import DemandSupply from "@/components/layout/onboarding-flow/demand-supply";
import LeftSectionWelcome from "@/components/layout/onboarding-flow/left-section-welcome";

const DemandSupplyPage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWelcome />
      <DemandSupply />
    </div>
  );
};

export default DemandSupplyPage;
