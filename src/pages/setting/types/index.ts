export interface ConfigSchema {
    title: string,
    nodes: Array<NodeSchema>,
    links: Array<LinkSchema>,
}

export interface NodeSchema {
    id: string,
    type: string,
    config: Record<string, any>,
    x: number,
    y: number,
}

export interface LinkSchema {
    from: string,
    to: string,
    condition?: ConditionSchema,
    modifiers?: Array<"Alt" | "Ctrl" | "Shift" | "Meta">
}

export interface NodeConfigSchema {
    type: string,
    config: Array<FormItemSchema>
}

export type ConditionSchema = {
    type: 'And',
    conditions: Array<ConditionSchema>,
} | {
    type: "Or",
    conditions: Array<ConditionSchema>,
} | {
    type: "Eq",
    values: [string, string]
}

export type FormSchema = {
    items: Array<FormItemSchema>
}

export type FormItemSchema = {
    label: string,
    prop: string,
    required?: boolean,
} & ({
    type: 'text',
    default?: string,
} | {
    type: 'textarea',
    default?: string,
} | {
    type: 'number',
    default?: number,
} | {
    type: 'date',
    default?: number,
} | {
    type: 'time',
    default?: string,
} | {
    type: 'checkbox'
    options: Array<{label: string, value: string}>,
    default?: Array<string>,
    max?: number,
} | {
    type: 'radio',
    options: Array<{label: string, value: string}>
    default?: string,
} | {
    type: 'switch'
    default?: boolean,
} | {
    type: 'object',
    items: Array<FormItemSchema>,
    default?: Record<string, any>,
} | {
    type: 'array',
    items: Array<FormItemSchema>,
    default?: Array<any>,
} | {
    type: 'json',
    default?: any,
})

export const optionSchema: Array<FormItemSchema> = [
    {
        label: "title",
        prop: "title",
        required: true,
        type: "text",
    },
    {
        label: "value",
        prop: "value",
        required: true,
        type: "json",
    },
    {
        label: "description",
        prop: "description",
        required: false,
        type: "text",
    },
    {
        label: "mark",
        prop: "mark",
        required: false,
        type: "checkbox",
        options: [
            {
                label: "hint",
                value: "Hint",
            },
            {
                label: "error",
                value: "Error",
            },
        ],
    }
]