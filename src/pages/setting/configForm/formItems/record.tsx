import { defineComponent, PropType } from "vue";
import { FormItemSchema, FormSchema, RecordFormItemSchema } from "../../schemas";
import Form from ".."

const props = {
    model: {
        type: Object as PropType<Record<string, any>>
    },
    schema: {
        type: Object as PropType<RecordFormItemSchema>
    }
}

export default defineComponent({
    name: "RecordFormItem",
    props,
    render() {
        return <Form model={this.$props.model} schema={this.$props.schema?.items}></Form>
    }
})