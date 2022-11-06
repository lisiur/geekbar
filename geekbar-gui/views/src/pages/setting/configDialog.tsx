import { defineComponent, reactive, ref } from "vue"
import { NModal, NButton } from 'naive-ui'
import ConfigForm from './configForm'
import { FormSchema } from "./schemas"

export interface ConfigDialogConfig {
    title: string,
    formSchema: FormSchema,
    model: Record<string, any>,
}

export function useConfigDialog() {
    const config = reactive<ConfigDialogConfig>({} as ConfigDialogConfig)
    let state = reactive({
        show: false,
    })
    const formRef = ref<InstanceType<typeof ConfigForm> | null>(null)
    let confirmHandler = () => { }
    const cancelHandler = hide
    const ConfigDialog = defineComponent({
        name: "ConfigDialog",
        render() {
            return <NModal
                preset="dialog"
                title={config.title}
                v-model:show={state.show}
                positive-text="Confirm"
                negative-text="Cancel"
                style="width: 560px"
                onPositiveClick={confirmHandler}
            >
                {{
                    default: () => <ConfigForm
                        ref={formRef}
                        model={config.model}
                        schema={config.formSchema}
                    ></ConfigForm>,
                    action: () => [
                        <NButton onClick={cancelHandler}>Cancel</NButton>,
                        <NButton type="primary" onClick={confirmHandler}>Confirm</NButton>
                    ]
                }}
            </NModal>
        }
    })

    async function show(cfg: ConfigDialogConfig) {
        Object.assign(config, cfg)
        state.show = true
        return new Promise(resolve => {
            confirmHandler = () => {
                formRef.value?.validate().then(() => {
                    resolve(config.model)
                    hide()
                })
            }
        })
    }

    function hide() {
        state.show = false
    }

    return {
        ConfigDialog,
        show,
        hide,
    }
}