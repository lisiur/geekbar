import { defineComponent, PropType } from "vue";
import { NForm } from "naive-ui"
import { FormItemSchema, FormSchema } from "../../types";

const props = {
    model: {
        type: Object as PropType<Record<string, any>>
    },
    schema: {
        type: Object as PropType<FormSchema>
    }
}

export default defineComponent({
    props,
    render() {
        return <NForm></NForm>
    }
})