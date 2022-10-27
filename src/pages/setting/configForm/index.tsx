import { defineComponent, PropType, reactive } from "vue";
import { FormItemSchema, FormSchema } from "../types";
import ObjectFormItem from "./formItems/Object";

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
        case 'array': {
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
        case 'object': {
            return initModel(schema)
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
    props,
    setup(props) {
        const model = initModel(props.schema!, props.model)
        return {
            model,
            schema: props.schema!
        }
    },
    render() {
        return <ObjectFormItem model={this.model} schema={this.schema}></ObjectFormItem>
    }
})