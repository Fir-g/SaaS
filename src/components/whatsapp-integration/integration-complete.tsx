import NextButton from "@/components/ui/next-button";

const IntegrationComplete = () => {
  return (
    <div className="flex flex-col w-full h-full py-4 px-4 md:px-8 lg:px-12 pt-16">
      {/* Main content area that grows to fill space */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-8">
        <div className="space-y-3 flex flex-col justify-center items-center text-center">
          <div className="mb-3">
            <img
              src="/success.svg"
              alt="whatsapp integration successful"
              className="h-24 sm:h-28 lg:h-32"
            />
          </div>
          <div className="text-gray-800 text-2xl sm:text-2xl lg:text-3xl font-semibold">
            WhatsApp integration verified
          </div>
          <p className="text-gray-500 text-base sm:text-lg max-w-md">
            Please click on complete setup to finish the integration of WhatsApp
          </p>
        </div>
      </div>

      {/* Button area that stays at bottom */}
      <div className="mt-6">
        <NextButton nextPageUrl="/integrations" text="Finish Setup" />
      </div>
    </div>
  );
};

export default IntegrationComplete;