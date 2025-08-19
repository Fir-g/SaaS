import api from "@/utils/api/api";

export const callApi = async (
  route: string,
  method: "get" | "post" | "put" | "delete" = "get",
  data?: any,
  params?: Record<string, any>
) => {
  try {
    const response = await api.request({
      url: route,
      method,
      data,
      params,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
