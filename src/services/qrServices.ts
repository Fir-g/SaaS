import qrApi from "@/utils/api/qrApi";

export const getQrCode = async () => {
  return await qrApi.post("/api/create-instance", {
    tenantId: "FT",
  });
};

