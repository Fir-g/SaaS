import NextButton from "@/components/ui/next-button";

const CRMSetupComplete = () => {
  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <div className="space-y-12">
        <div className="space-y-4 flex flex-col justify-center items-center">
          <div className="mb-4">
            <img
              src="/success.svg"
              alt="whatsapp integration successful"
              className="h-32"
            />
          </div>
          <div className="text-gray-800 text-3xl font-semibold">
            Almost done
          </div>
          <p className="text-gray-500 text-muted-foreground text-lg">
            You will be notified once your CRM is Setup
          </p>
        </div>
      </div>
      <NextButton text="Navigate to Dashboard" nextPageUrl="/dashboard" />
    </div>
  );
};

export default CRMSetupComplete;
