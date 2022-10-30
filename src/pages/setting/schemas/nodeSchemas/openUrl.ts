import { NodeConfigSchema } from "../types";

export const openUrlConfigSchema: NodeConfigSchema = {
  type: "OpenUrl",
  config: {
    items: [
      {
        label: "url",
        prop: "url",
        required: true,
        type: "text",
      },
    ],
  },
};
