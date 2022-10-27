import { defineComponent, PropType } from "vue";
import { FormSchema } from "../../types";

const props = {
    model: {
        type: Object as PropType<Record<string, any>>
    },
    schema: {
        type: Object as PropType<FormSchema>
    }
}

export default defineComponent({
    render() {
        
    }
})