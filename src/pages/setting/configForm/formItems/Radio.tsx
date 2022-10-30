import { computed, defineComponent, PropType } from "vue";
import { NRadio, NRadioGroup } from 'naive-ui'
import { RadioFormItemSchema } from "../../schemas";
import { vFor } from "../../../../utils/jsxHelper";

const props = {
    value: {
        type: String as PropType<string>
    },
    schema: {
        type: Object as PropType<RadioFormItemSchema>
    }
}

export default defineComponent({
    name: "RadioFormItem",
    props,
    setup(props, { emit }) {
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
        return <NRadioGroup v-model:value={this.value}>
            {
                vFor(
                    this.$props.schema?.options ?? [], 
                    (opt) => <NRadio value={opt.value} label={opt.label} class="mr-2"></NRadio>
                )
            }
        </NRadioGroup>
    }
})