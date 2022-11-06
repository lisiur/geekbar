import { NInput } from "naive-ui";
import { computed, defineComponent, PropType } from "vue";
import { TextareaFormItemSchema } from "../../schemas";

const props = {
    value: {
        type: Object as PropType<string>
    },
    schema: {
        type: Object as PropType<TextareaFormItemSchema>
    }
}

export default defineComponent({
    name: "TextareaFormItem",
    props,
    setup(props, {emit}) {
        return {
            value: computed({
                get() {
                    return props.value ?? ''
                },
                set(v: string) {
                    emit('update:value', v)
                }
            })
        }
    },
    render() {
        return <NInput type="textarea" v-model:value={this.value}></NInput>
    }
})