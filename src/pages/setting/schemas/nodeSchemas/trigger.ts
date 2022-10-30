import { NodeConfigSchema } from "../types";

export const triggerConfigSchema: NodeConfigSchema = {
  type: "Trigger",
  config: {
    items: [
      {
        label: "Title",
        prop: "title",
        type: "text",
      },
      {
        label: "type",
        prop: "type",
        required: true,
        type: "radio",
        options: [
          {
            label: "keyword",
            value: "Keyword",
          },
          {
            label: "shortcut",
            value: "Shortcut",
          },
        ],
      },
      {
        label: "keyword",
        prop: "keyword",
        required: false,
        type: "text",
      },
      {
        label: "keys",
        prop: "keys",
        required: false,
        type: "text",
      },
    ],
  },
};
