export type StepType = {
  stepNo: number;
  stepName: string;
  url: string;
};

export const WhatsappSteps: StepType[] = [
  {
    stepNo: 1,
    stepName: "Connect to WhatsApp",
    url: "/whatsapp",
  },
  {
    stepNo: 2,
    stepName: "Configure team members",
    url: "/whatsapp/team-members",
  },
  {
    stepNo: 3,
    stepName: "Configure conversations",
    url: "/whatsapp/group",
  },
  {
    stepNo: 4,
    stepName: "Finish Setting up WhatsApp",
    url: "/whatsapp/success",
  },
  // {
  //   stepName: "Configure Test demand message",
  // },
];

export const CRMSteps: StepType[] = [
  {
    stepNo: 1,
    stepName: "Connect CRM",
    url: "/crm",
  },
  {
    stepNo: 2,
    stepName: "Upload Master data",
    url: "/upload-data",
  },
  {
    stepNo: 3,
    stepName: "Complete setup",
    url: "/crm-success",
  },
];
