import { NodeConfigSchema } from "../types";

export const clipboardConfigSchema: NodeConfigSchema = {
  type: "Clipboard",
  config: {
    items: [
      {
        label: "content",
        prop: "content",
        required: false,
        type: "text",
      },
    ],
  },
};
