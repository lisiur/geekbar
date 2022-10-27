import { NodeConfigSchema } from ".";

export const clipboardConfigSchema: NodeConfigSchema = {
    type: "Clipboard",
    config: [
        {
            label: "content",
            prop: "content",
            required: false,
            type: 'text',
        }
    ]
}