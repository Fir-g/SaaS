import LeftSectionWelcome from "@/components/layout/onboarding-flow/left-section-welcome";
import LoadSync from "@/components/layout/onboarding-flow/load-sync";

const LoadSyncPage = ()  =>{
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWelcome />
      <LoadSync />
    </div>
  );
}

export default LoadSyncPage