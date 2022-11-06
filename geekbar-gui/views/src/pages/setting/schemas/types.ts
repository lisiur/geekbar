import { Expr } from "./expr";

export interface ConfigSchema {
  id: string;
  title: string;
  nodes: Array<NodeSchema>;
  links: Array<LinkSchema>;
}

export interface NodeSchema {
  id: string;
  type: string;
  config: Record<string, any>;
  x: number;
  y: number;
}

export interface LinkSchema {
  from: string;
  to: string;
  condition?: ConditionSchema;
  modifiers?: Array<"Alt" | "Ctrl" | "Shift" | "Meta">;
}

export interface NodeConfigSchema {
  type: string;
  config: FormSchema;
}

export type ConditionSchema =
  | {
      type: "And";
      conditions: Array<ConditionSchema>;
    }
  | {
      type: "Or";
      conditions: Array<ConditionSchema>;
    }
  | {
      type: "Eq";
      values: [string, string];
    };

export type FormSchema = {
  items: Array<FormItemSchema>;
};

export type FormItemBaseSchema = {
  type: string;
  prop: string;
  label?: string;
  required?: Expr;
  visible?: Expr;
};

export interface TextFormItemSchema extends FormItemBaseSchema {
  type: "text";
  default?: string;
}

export interface TextareaFormItemSchema extends FormItemBaseSchema {
  type: "textarea";
  default?: string;
}

export interface NumberFormItemSchema extends FormItemBaseSchema {
  type: "number";
  default?: number;
}

export interface DateFormItemSchema extends FormItemBaseSchema {
  type: "date";
  default?: number;
}

export interface TimeFormItemSchema extends FormItemBaseSchema {
  type: "time";
  default?: string;
}

export interface CheckboxFormItemSchema extends FormItemBaseSchema {
  type: "checkbox";
  options: Array<{ label: string; value: string }>;
  default?: Array<string>;
  max?: number;
  min?: number;
}

export interface RadioFormItemSchema extends FormItemBaseSchema {
  type: "radio";
  options: Array<{ label: string; value: string }>;
  default?: string;
}

export interface SwitchFormItemSchema extends FormItemBaseSchema {
  type: "switch";
  default?: boolean;
}

export interface RecordFormItemSchema extends FormItemBaseSchema {
  type: "record";
  items: FormSchema;
  default?: Record<string, any>;
}

export interface ListFormItemSchema extends FormItemBaseSchema {
  type: "list";
  items: FormSchema;
  default?: Record<string, any>;
  min?: number;
  max?: number;
}

export interface JsonFormItemSchema extends FormItemBaseSchema {
  type: "json";
  default?: any;
}

export type FormItemSchema =
  | TextFormItemSchema
  | TextareaFormItemSchema
  | NumberFormItemSchema
  | DateFormItemSchema
  | TimeFormItemSchema
  | CheckboxFormItemSchema
  | RadioFormItemSchema
  | SwitchFormItemSchema
  | RecordFormItemSchema
  | ListFormItemSchema
  | JsonFormItemSchema;

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
];
