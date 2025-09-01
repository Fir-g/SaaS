import api from "@/utils/api/api";

export type GmailAuthResponse = {
  auth_url: string;
  state: string;
};

export const getGmailAuthUrl = async (): Promise<GmailAuthResponse> => {
  // Use absolute URL (different backend root), but keep our api instance for auth headers
  const res = await api.get(
    "https://freight-tiger-backend.thetailoredai.co/gmail_login/auth-url"
  );
  return res.data as GmailAuthResponse;
};


