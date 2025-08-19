import api from "@/utils/api/api";

export const getTenantInstances = async (tenantId:string) => {
  try {
    const response = await api.get(`sqldb/instances/${tenantId}/tenant-instances`);
    return response.data;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch instances");
  }
};
