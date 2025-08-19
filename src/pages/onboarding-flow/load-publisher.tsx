import LeftSectionWelcome from "@/components/layout/onboarding-flow/left-section-welcome";
import LoadPublisher from "@/components/layout/onboarding-flow/load-publisher";

const LoadPublisherPage=()=> {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionWelcome />
      <LoadPublisher />
    </div>
  );
}

export default LoadPublisherPage;
