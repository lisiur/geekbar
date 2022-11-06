import { computed, defineComponent, PropType } from "vue";
import { NCheckboxGroup, NCheckbox } from 'naive-ui'
import { CheckboxFormItemSchema } from "../../schemas";
import { vFor } from "../../../../utils/jsxHelper";

const props = {
    value: {
        type: Array as PropType<Array<string>>
    },
    schema: {
        type: Object as PropType<CheckboxFormItemSchema>
    }
}

export default defineComponent({
    name: "CheckboxFormItem",
    props,
    setup(props, { emit }) {
        return {
            value: computed({
                get() {
                    return props.value ?? []
                },
                set(v: Array<string>) {
                    emit('update:value', v)
                }
            })
        }
    },
    render() {
        return <NCheckboxGroup v-model:value={this.value}>
            {
                vFor(
                    this.$props.schema?.options ?? [], 
                    (opt) => <NCheckbox value={opt.value} label={opt.label} class="mr-2"></NCheckbox>
                )
            }
        </NCheckboxGroup>
    }
})