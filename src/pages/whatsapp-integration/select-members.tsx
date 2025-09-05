import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";
import SelectTeamMembers from "@/components/whatsapp-integration/select-members";

const SelectTeamMembersPage = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-background">
      <LeftSectionWhatsapp currentStep={"Configure team members"} stepNo={2} />
      <div className="flex-1 lg:w-3/4">
        <SelectTeamMembers />
      </div>
    </div>
  );
};

export default SelectTeamMembersPage;
