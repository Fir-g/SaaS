import NextButton from "@/components/ui/next-button";
import PageWrapper from "../../ui/page-wrapper";
import { useEffect, useState } from "react";
import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import {
  getWhatsAppGroups,
  getWhitelistedGroups,
  postWhitelistedGroups,
} from "@/services/groupServices";
import GrouplistTable from "./grouplist-table";

const phone_number = import.meta.env.VITE_PHONE_NUMBER;

const SelectGroup = () => {
  const [fetchedGroups, setFetchedGroups] = useState<WhitelistedGroupType[]>(
    []
  );
  const [whatsAppGroups, setWhatsAppGroups] = useState<WhatsAppGroupType[]>([]);
  const [whitelistedGroups, setWhitelistedGroups] = useState<
    WhitelistedGroupType[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const combinedGroup = whatsAppGroups.map((group) => {
    const matchingWhitelisted = fetchedGroups.find(
      (g) => g.whitelisted_id === group.id
    );
    return {
      id: group.id,
      whitelisted_name: group.name,
      phone_number: phone_number,
      // source: matchingWhitelisted ? "whitelisted" : "whatsapp",
      whitelisted_type: group.isGroup ? "group" : "one on one",
      participantsCount: group.participantsCount,
      checked: !!matchingWhitelisted,
    };
  });

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true);
        setError("");
        const [whitelistedGroups, waGroups] = await Promise.all([
          getWhitelistedGroups(), // WhitelistedGroupType[]
          getWhatsAppGroups(phone_number), // WhatsAppGroupType[]
        ]);
        setFetchedGroups(whitelistedGroups);
        setWhitelistedGroups(whitelistedGroups);
        setWhatsAppGroups(waGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to fetch groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getGroups();
  }, []);

  const handleToggle = (group_id: string, checked: boolean) => {
    const group = combinedGroup.find((g) => g.id === group_id);
    if (!group) return;

    if (checked) {
      setWhitelistedGroups((prev) => {
        // Avoid duplicates
        const alreadyExists = prev.some(
          (entry) => entry.whitelisted_id === group.id
        );
        if (alreadyExists) return prev;

        const newEntry: WhitelistedGroupType = {
          phone_number: group.phone_number,
          tenant_id: "FT",
          whitelisted_id: group.id,
          whitelisted_type: group.whitelisted_type,
          whitelisted_name: group.whitelisted_name,
          lsp_name: "mktest",
        };

        return [...prev, newEntry];
      });
      setFetchedGroups((prev) => {
        const alreadyExists = prev.some(
          (entry) => entry.whitelisted_id === group.id
        );
        if (alreadyExists) return prev;

        const newEntry: WhitelistedGroupType = {
          phone_number: group.phone_number,
          tenant_id: "FT",
          whitelisted_id: group.id,
          whitelisted_type: group.whitelisted_type,
          whitelisted_name: group.whitelisted_name,
          lsp_name: "mktest",
        };

        return [...prev, newEntry];
      });
    } else {
      setWhitelistedGroups((prev) =>
        prev.filter((entry) => entry.whitelisted_id !== group.id)
      );
      setFetchedGroups((prev) =>
        prev.filter((entry) => entry.whitelisted_id !== group.id)
      );
    }
  };

  const handleNextClick = async () => {
    // console.log(whitelistedGroups);
    await postWhitelistedGroups(whitelistedGroups);
  };

  return (
    <div className="flex flex-col w-full h-screen py-4 px-12 pt-20">
      <PageWrapper
        header=" Configure conversations to read"
        description=" We value your privacy and data and understand that it might be
            uncomfortable to have an AI agent scanning your WhatsApp. We provide
            you full freedom to select & mark which numbers or groups you want
            us to skip reading in our analysis."
      >
        <div className="shadow-lg sm:rounded-lg mt-6 h-96 overflow-auto">
          <GrouplistTable
            combinedGroup={combinedGroup}
            whitelistedGroups={whitelistedGroups}
            handleToggle={handleToggle}
            error={error}
            loading
          />
        </div>
      </PageWrapper>
      <NextButton
        handleClick={handleNextClick}
        nextPageUrl="/whatsapp/success"
        text="Next"
      />
    </div>
  );
};

export default SelectGroup;
