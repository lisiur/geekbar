import { computed, defineComponent, PropType } from "vue";
import { NSwitch } from 'naive-ui'
import { SwitchFormItemSchema } from "../../schemas";

const props = {
    value: {
        type: Boolean as PropType<boolean>
    },
    schema: {
        type: Object as PropType<SwitchFormItemSchema>
    }
}

export default defineComponent({
    name: "SwitchFormItem",
    props,
    setup(props, {emit}) {
        return {
            value: computed({
                get() {
                    return props.value ?? false
                },
                set(v: boolean) {
                    emit('update:value', v)
                }
            })
        }
    },
    render() {
        return <NSwitch v-model:value={this.value}></NSwitch>
    }
})