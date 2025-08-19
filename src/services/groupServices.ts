import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import api from "@/utils/api/api";
import qrApi from "@/utils/api/qrApi";

export const getWhitelistedGroups = async () => {
  try {
    const response = await api.get("/sqldb/FT/whitelisted-entries");
    return response.data.entries;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const getWhatsAppGroups = async (phoneNumber: string) => {
  try {
    const response: { success: boolean; chats: WhatsAppGroupType[] } =
      await qrApi.get(`/api/instances/${phoneNumber}/chats`);
    // console.log(response);
    return response.chats;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const postWhitelistedGroups = async (
  whitelistedGroups: WhitelistedGroupType[]
) => {
  try {
    const response = await api.post("/sqldb/whitelist/bulk", {
      tenant_id: "FT",
      entries: whitelistedGroups,
    });
    if (response.status == 200) {
      console.log("successfully added groups to whitelist");
    }
  } catch (error) {
    throw new Error(`Error fetching whitelisted groups: ${error}`);
  }
};
