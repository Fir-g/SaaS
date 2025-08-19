export interface Integration {
  id: string;
  icon: string;
  name: string;
  description: string;
  connectionStatus?: string;
}

export const sourcingIntegrations: Integration[] = [
  {
    id: "whatsapp",
    icon: "/whatsapp.svg",
    name: "Whatsapp",
    description: "Connect WhatsApp groups receive demands",
    connectionStatus: "1 Connection active",
  },
  {
    id: "gmail",
    icon: "/gmail.svg",
    name: "Gmail",
    description: "Connect WhatsApp groups receive demands",
  },
  {
    id: "google-sheets",
    icon: "/google-sheets.svg",
    name: "Google sheets",
    description: "Connect WhatsApp groups receive demands",
  },
];

export const publishingIntegrations: Integration[] = [
  {
    id: "zoho-crm",
    icon: "/crm.svg",
    name: "Zoho CRM",
    description: "Connect WhatsApp groups receive demands",
    connectionStatus: "1 Connection active",
  },
  {
    id: "crm-system",
    icon: "/crm.svg",
    name: "CRM system",
    description: "Connect WhatsApp groups receive demands",
  },
];
