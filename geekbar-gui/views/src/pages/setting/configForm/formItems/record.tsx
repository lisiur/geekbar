import { defineComponent, PropType, ref } from "vue";
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
    setup() {
        const formRef = ref<InstanceType<typeof Form> | null>(null);

        function validate() {
            return formRef.value?.validate()
        }

        return {
            formRef,
            validate,
        }
    },
    render() {
        return <Form ref="formRef" model={this.$props.model} schema={this.$props.schema?.items}></Form>
    }
})