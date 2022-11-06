import { computed, defineComponent, PropType } from "vue";
import { NInput } from 'naive-ui'
import { TextFormItemSchema } from "../../schemas";

const props = {
    value: {
        type: String as PropType<string>
    },
    schema: {
        type: Object as PropType<TextFormItemSchema>
    }
}

export default defineComponent({
    name: "TextFormItem",
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
        return <NInput v-model:value={this.value}></NInput>
    }
})