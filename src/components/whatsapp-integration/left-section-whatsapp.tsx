import { Button } from "@/components/ui/button";
import Stepper from "@/components/ui/stepper";
import { WhatsappSteps } from "@/constants/steps";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type LeftSectionWhatsappPropType = {
  currentStep: string;
  stepNo: number;
};

const LeftSectionWhatsapp = ({
  currentStep,
  stepNo,
}: LeftSectionWhatsappPropType) => {
  return (
    <div className="flex flex-col min-h-screen w-full lg:w-3/5 bg-[#EEEFFA] py-6 px-6 sm:px-8 lg:px-12">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <p className="text-gray-700 text-sm sm:text-base mb-4 lg:mb-6">
          WhatsApp Integration
        </p>
        <div className="text-gray-800 text-xl sm:text-2xl lg:text-2xl font-semibold mb-2">
          Hello, User!
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          Please complete the following steps for smooth integration of WhatsApp
        </p>
      </div>

      {/* Stepper Section */}
      <div className="flex-1">
        <Stepper
          steps={WhatsappSteps}
          currentStep={currentStep}
          stepNo={stepNo}
        />
      </div>

      {/* Bottom Action Button */}
      <div className="mt-auto pt-6">
        <Button
          variant="outline"
          className="flex items-center justify-center text-gray-800 text-base sm:text-lg font-medium w-full sm:w-auto px-6 py-3 gap-3 hover:bg-white/50 transition-colors"
        >
          <span>See how it works</span>
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default LeftSectionWhatsapp;