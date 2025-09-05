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
    <div className="flex flex-col h-full w-full lg:w-1/4 bg-[#EEEFFA] py-4 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-4 lg:mb-6">
        <p className="text-gray-700 text-sm sm:text-base mb-2 lg:mb-3">
          WhatsApp Integration
        </p>
        <div className="text-gray-800 text-lg sm:text-xl lg:text-xl font-semibold mb-1">
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
      <div className="mt-auto pt-4">
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