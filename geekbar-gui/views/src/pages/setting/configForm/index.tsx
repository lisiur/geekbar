import { NForm, NFormItem, FormItemRule } from "naive-ui";
import { defineComponent, PropType, reactive, ref } from "vue";
import { ListFormItemSchema, FormItemSchema, FormSchema, RecordFormItemSchema, TextareaFormItemSchema, TextFormItemSchema, JsonFormItemSchema, RadioFormItemSchema, CheckboxFormItemSchema } from "../schemas";
import { vFor, vMatch } from "../../../utils/jsxHelper";
import { evalExprToBool } from "../schemas/expr";
import TextFormItem from "./formItems/text";
import TextareaFormItem from "./formItems/textarea";
import ListFormItem from "./formItems/list";
import CheckboxFormItem from "./formItems/checkbox";
import RadioFormItem from "./formItems/radio";
import DateFormItem from "./formItems/date";
import SwitchFormItem from "./formItems/switch";
import TimeFormItem from "./formItems/time";
import RecordFormItem from "./formItems/record";
import JsonFormItem from "./formItems/json";

const props = {
    model: {
        type: Object as PropType<Record<string, any>>
    },
    schema: {
        type: Object as PropType<FormSchema>,
        required: true,
    }
}

export function initModel(schema: FormSchema, model: Record<string, any> = {}) {
    for (const itemSchema of schema.items) {
        model[itemSchema.prop] ??= itemSchema.default ?? defaultValue(itemSchema)
    }
    return reactive(model)
}

function defaultValue(schema: FormItemSchema) {
    if (!schema.required) {
        return undefined
    }
    switch (schema.type) {
        case 'list': {
            return []
        }
        case 'checkbox': {
            return []
        }
        case 'date': {
            return 0
        }
        case 'time': {
            return '00:00:00'
        }
        case 'number': {
            return 0
        }
        case 'record': {
            return {}
        }
        case 'radio': {
            return ''
        }
        case 'switch': {
            return false
        }
        case 'text': {
            return ''
        }
        case 'textarea': {
            return ''
        }
    }
    return undefined
}

function triggerType(schema: FormItemSchema) {
    switch (schema.type) {
        case 'json': {
            return "blur"
        }
        case 'text':
        case 'textarea': {
            return "input"
        }
        default: {
            return "change"
        }
    }
}

function dataType(schema: FormItemSchema): FormItemRule['type'] {
    switch (schema.type) {
        case 'json': {
            return "any"
        }
        case 'number': {
            return "number"
        }
        case 'checkbox':
        case 'list': {
            return 'array'
        }
        default: {
            return "string"
        }
    }
}

export default defineComponent({
    name: "ConfigForm",
    props,
    setup(props) {
        const model = initModel(props.schema!, props.model)
        const formRef = ref<InstanceType<typeof NForm> | null>(null)
        const listFormItemRef = ref<InstanceType<typeof ListFormItem> | null>(null)
        const recordFormItemRef = ref<any>(null)
        async function validate(): Promise<undefined> {
            return Promise.all([
                formRef.value?.validate(),
                listFormItemRef.value?.validate(),
                recordFormItemRef.value?.validate(),
            ]).then(() => void 0)
        }
        return {
            model,
            schema: props.schema!,
            formRef,
            validate,
            listFormItemRef,
            recordFormItemRef,
        }
    },
    render() {
        const _evalExprToBool = evalExprToBool.bind(null, this.$props.model ?? {})
        return <NForm
            ref="formRef"
            labelPlacement="left"
            labelWidth="auto"
            class="pr-4"
            model={this.$props.model}
        >
            {
                vFor(this.$props.schema!.items, (formItemSchema) => {
                    if (_evalExprToBool(formItemSchema.visible ?? true)) {
                        const rules: Array<FormItemRule> = []
                        const required = _evalExprToBool(formItemSchema.required)
                        const label = formItemSchema.label ?? ''
                        const trigger = triggerType(formItemSchema)
                        if (required) {
                            const requiredRule: FormItemRule = {
                                required: true,
                                message: `${label} is required`,
                                trigger,
                                type: dataType(formItemSchema),
                            }
                            rules.push(requiredRule)
                        }
                        return <NFormItem
                            label={formItemSchema.label}
                            path={formItemSchema.prop}
                            rule={rules}
                        >
                            {
                                vMatch(
                                    [
                                        formItemSchema.type === 'text',
                                        () => <TextFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as TextFormItemSchema}></TextFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'textarea',
                                        () => <TextareaFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as TextareaFormItemSchema}></TextareaFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'checkbox',
                                        () => <CheckboxFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as CheckboxFormItemSchema}></CheckboxFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'radio',
                                        () => <RadioFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as RadioFormItemSchema}></RadioFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'date',
                                        () => <DateFormItem></DateFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'switch',
                                        () => <SwitchFormItem></SwitchFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'time',
                                        () => <TimeFormItem></TimeFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'list',
                                        () => <ListFormItem
                                            ref="listFormItemRef"
                                            v-model:value={this.$props.model![formItemSchema.prop]}
                                            schema={formItemSchema as ListFormItemSchema}
                                        ></ListFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'record',
                                        () => <RecordFormItem
                                            ref="recordFormItemRef"
                                            v-model:value={this.$props.model![formItemSchema.prop]}
                                            schema={formItemSchema as RecordFormItemSchema}
                                        ></RecordFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'json',
                                        () => <JsonFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as JsonFormItemSchema}></JsonFormItem>
                                    ],
                                )
                            }
                        </NFormItem>
                    }
                })
            }
        </NForm>
    }
})