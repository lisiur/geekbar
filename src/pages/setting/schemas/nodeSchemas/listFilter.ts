import { NodeConfigSchema, optionSchema } from "../types";

export const listFilterConfigSchema: NodeConfigSchema = {
  type: "ListFilter",
  config: {
    items: [
      {
        label: "title",
        prop: "title",
        required: false,
        type: "text",
      },
      {
        label: "options",
        prop: "options",
        required: false,
        type: "list",
        items: {
          items: optionSchema
        },
      },
      {
        label: "need args",
        prop: "need_args",
        required: false,
        type: "radio",
        options: [
          {
            label: "always",
            value: "Always",
          },
          {
            label: "optional",
            value: "Optional",
          },
          {
            label: "never",
            value: "Never",
          },
        ],
      },
    ],
  },
};
