import api from "@/utils/api/api";

export const getBlacklistedContacts = async () => {
  try {
    const response = await api.get("/FT/blacklisted-numbers");
    return response.data;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch blacklisted contacts");
  }
};
