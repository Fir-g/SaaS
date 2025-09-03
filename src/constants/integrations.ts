export interface Integration {
  id: string;
  icon: string;
  name: string;
  description: string;
  connectionStatus?: string;
  url: string;
}

export const sourcingIntegrations: Integration[] = [
  {
    id: "whatsapp",
    icon: "/whatsapp.svg",
    name: "Whatsapp",
    description: "Connect WhatsApp groups receive demands",
    url: "/whatsapp-integration",
    // connectionStatus: "1 Connection active",
  },
  {
    id: "gmail",
    icon: "/gmail.svg",
    name: "Gmail",
    description: "Connect Gmail to receive demands",
    url: "/gmail-integration",
  }
];

export const publishingIntegrations: Integration[] = [
  {
    id: "google-sheets",
    icon: "/google-sheets.svg",
    name: "Google sheets",
    description: "Connect Google Sheets to receive demands",
    url: "/google-sheets-integration",
  },
  {
    id: "crm-system",
    icon: "/crm.svg",
    name: "CRM system",
    description: "Connect CRM system for publishing",
    url: "/crm",
  },
];
