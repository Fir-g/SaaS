import OptionCard from "../../ui/option-card";
import PageWrapper from "../../ui/page-wrapper";
import { useNavigate } from "react-router-dom";
import NextButton from "../../ui/next-button";
import { useState } from "react";
import { channels, CRMS } from "@/constants/channels-crms";

const DemandIntegration = () => {
  // const [channel, setChannel] = useState<string>("")
  const [crm, setCrm] = useState<string>("");

  const navigate = useNavigate();

  const handleSelect = (value: string) => {
    //need to implement routing based on selected channel
    setCrm(value);
    value === "Crm System" && navigate(`/crm`);
  };
  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <PageWrapper
        header="Source Integration"
        description="Select the tool which you want to start the integration with"
      >
        <OptionCard options={channels} onSelect={handleSelect} />
      </PageWrapper>
      <div className="border border-spacing-4 my-6 border-gray-200"></div>
      <PageWrapper
        header="Publishing integration"
        description="Select the tool which you want to start the integration with"
      >
        <OptionCard
          options={CRMS}
          onSelect={handleSelect}
          selectedOption={crm}
        />
      </PageWrapper>
      <NextButton nextPageUrl="/crm" text="Next" />
    </div>
  );
};

export default DemandIntegration;
