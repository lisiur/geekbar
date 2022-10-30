import { defineComponent, reactive } from "vue"
import { NModal } from 'naive-ui'
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
            >
                <ConfigForm
                    model={config.model}
                    schema={config.formSchema}
                ></ConfigForm>
            </NModal>
        }
    })
    async function show(cfg: ConfigDialogConfig) {
        Object.assign(config, cfg)
        state.show = true
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