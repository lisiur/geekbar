import { NForm, NFormItem } from "naive-ui";
import { defineComponent, PropType, reactive } from "vue";
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

function initModel(schema: FormSchema, model: Record<string, any> = {}) {
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

export default defineComponent({
    name: "ConfigForm",
    props,
    setup(props) {
        const model = initModel(props.schema!, props.model)
        return {
            model,
            schema: props.schema!
        }
    },
    render() {
        const _evalExprToBool = evalExprToBool.bind(null, this.$props.model ?? {})
        return <NForm labelPlacement="left" labelWidth="auto">
            {
                vFor(this.$props.schema!.items, (formItemSchema) => {
                    if (_evalExprToBool(formItemSchema.visible ?? true)) {
                        return <NFormItem label={formItemSchema.label}>
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
                                        () => <ListFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as ListFormItemSchema}></ListFormItem>
                                    ],
                                    [
                                        formItemSchema.type === 'record',
                                        () => <RecordFormItem v-model:value={this.$props.model![formItemSchema.prop]} schema={formItemSchema as RecordFormItemSchema}></RecordFormItem>
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