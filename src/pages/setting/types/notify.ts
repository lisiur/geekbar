import { NodeConfigSchema } from ".";

export const notifyConfigSchema: NodeConfigSchema = {
    type: "Notify",
    config: [
        {
            label: "summary",
            prop: "summary",
            required: true,
            type: 'text',
        },
        {
            label: "body",
            prop: "body",
            required: false,
            type: 'text',
        },
    ]
}