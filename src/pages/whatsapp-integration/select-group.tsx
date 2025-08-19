import LeftSectionWhatsapp from "@/components/layout/whatsapp-integration/left-section-whatsapp";
import SelectGroup from "@/components/layout/whatsapp-integration/select-group";

const SelectGrouptoRead = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      {" "}
      <LeftSectionWhatsapp currentStep={"Configure conversations"} stepNo={3} />
      <SelectGroup />
    </div>
  );
};

export default SelectGrouptoRead;
