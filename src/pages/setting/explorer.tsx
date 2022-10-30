import { NButton, NInput, NText } from "naive-ui";
import { computed, defineComponent, onMounted, PropType, reactive, watch } from "vue";
import { dialog } from "../../utils";
import { vFor } from "../../utils/jsxHelper";
import { ConfigSchema } from "./schemas";

const props = {
    workflows: Object as PropType<Array<ConfigSchema>>,
    onSelect: Function as PropType<(workflow: ConfigSchema) => any>,
    onCreate: Function as PropType<(name: string) => any>
}

export default defineComponent({
    name: "Explorer",
    props,
    setup(props) {
        const state = reactive({
            newWorkflowName: '',
            activeWorkflow: undefined as undefined | ConfigSchema
        })

        watch(() => props.workflows, () => {
            if (props.workflows?.length) {
                selectHandler(props.workflows![0])
            } else {
                state.activeWorkflow = undefined
            }
        }, {
            immediate: true,
        })

        const confirmBtnDisabled = computed(() => !state.newWorkflowName)

        function createHandler() {
            const dg = dialog.create({
                title: "Create new workflow",
                content() {
                    return <NInput v-model:value={state.newWorkflowName}></NInput>
                },
                action() {
                    return [
                        <NButton onClick={cancelHandler}>Cancel</NButton>,
                        <NButton type="primary" disabled={confirmBtnDisabled.value} onClick={confirmHandler}>Confirm</NButton>
                    ]
                },
            })

            function cancelHandler() {
                dg.destroy();
            }

            function confirmHandler() {
                dg.destroy();
                props.onCreate?.(state.newWorkflowName)
            }
        }

        function selectHandler(workflow: ConfigSchema) {
            state.activeWorkflow = workflow
            props.onSelect?.(workflow)
        }

        return {
            state,
            createHandler,
            selectHandler,
        }
    },
    render() {
        return <div class="h-full flex flex-col">
            <div class="flex-1 overflow-auto">
                {
                    vFor(
                        this.$props.workflows ?? [],
                        (config) => {
                            const isActive = this.state.activeWorkflow === config
                            const classes = isActive ? ["bg-primary text-background"] : []
                            return <div
                                class={["h-12 flex items-center border-b px-4 cursor-pointer", ...[classes]]}
                                onClick={() => this.selectHandler(config)}
                            >
                                <span>{config.title}</span>
                            </div>
                        }
                    )
                }
            </div>
            <div>
                <NButton
                    class="w-full"
                    type="primary"
                    onClick={this.createHandler}
                >Create</NButton>
            </div>
        </div>
    }
})