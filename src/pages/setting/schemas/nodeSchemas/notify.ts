import { NodeConfigSchema } from "../types";

export const notifyConfigSchema: NodeConfigSchema = {
  type: "Notify",
  config: {
    items: [
      {
        label: "summary",
        prop: "summary",
        required: true,
        type: "text",
      },
      {
        label: "body",
        prop: "body",
        required: false,
        type: "text",
      },
    ],
  },
};
