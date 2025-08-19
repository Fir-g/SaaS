export type WhitelistedGroupType = {
  id?: number;
  lsp_name: string;
  phone_number: string;
  tenant_id: string;
  whitelisted_id: string;
  whitelisted_name: string;
  whitelisted_type: string;
};

export type WhatsAppGroupType = {
  id: string;
  name: string;
  isGroup: boolean;
  participantsCount: number;
};

export type CombinedGroupType = {
  id: string;
  whitelisted_name: string;
  phone_number: string;
  // source: string;
  whitelisted_type: string;
  participantsCount: number;
  checked: boolean;
};
