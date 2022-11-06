import { defineComponent, PropType, ref, watch } from "vue";
import { NInput } from 'naive-ui'
import { JsonFormItemSchema } from "../../schemas";

const props = {
    value: {
        type: [Object, String, Number, Array, Boolean] as PropType<any>
    },
    schema: {
        type: Object as PropType<JsonFormItemSchema>
    }
}

export default defineComponent({
    name: "JsonFormItem",
    props,
    setup(props, {emit}) {
        const value = ref(JSON.stringify(props.value ?? ''))
        watch(() => props.value, () => {
            value.value = JSON.stringify(props.value)
        })
        
        function updateValueHandler() {
            let newValue
            try {
                newValue = JSON.parse(value.value)
                emit("update:value", newValue)
            } catch(e: any) {
                emit("update:value", undefined)
                // alert(e.toString())
            }
        }

        return {
            value,
            updateValueHandler,
        }
    },
    render() {
        return <NInput type="textarea" v-model:value={this.value} onBlur={this.updateValueHandler}></NInput>
    }
})