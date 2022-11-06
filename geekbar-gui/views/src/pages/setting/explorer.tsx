import { NButton, NInput, NText } from "naive-ui";
import { computed, defineComponent, onMounted, PropType, reactive, watch } from "vue";
import { dialog } from "../../utils";
import { vFor } from "../../utils/jsxHelper";
import { useContextmenu } from "./contextmenu";
import { ConfigSchema, NodeSchema } from "./schemas";

const props = {
    workflows: Object as PropType<Array<ConfigSchema>>,
    onSelect: Function as PropType<(workflow: ConfigSchema) => any>,
    onCreate: Function as PropType<(name: string) => any>,
    onDelete: Function as PropType<(name: string) => any>,
    onRename: Function as PropType<(name: string) => any>,
}

export default defineComponent({
    name: "Explorer",
    props,
    setup(props) {
        const state = reactive({
            activeWorkflow: undefined as undefined | ConfigSchema
        })

        const { Contextmenu, show: showContextmenu } = useContextmenu()

        function contextmenuHandler(config: ConfigSchema, e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()
            showContextmenu(e, [{
                key: "delete",
                label: "Delete",
            }], async (key) => {
                switch (key) {
                    case 'delete': {
                        await props.onDelete?.(config.id)
                        break
                    }
                    default: {
                        const model = reactive({
                            name: config.title,
                        })
                        const dl = dialog.create({
                            title: "Modify workflow name",
                            content() {
                                return <NInput v-model:value={model.name}></NInput>
                            },
                            action() {
                                return [
                                    <NButton onClick={cancelHandler}>Cancel</NButton>,
                                    <NButton type="primary" disabled={!model.name} onClick={confirmHandler}>Confirm</NButton>
                                ]
                            }
                        })
                        function cancelHandler() {
                            dl.destroy();
                        }
                        function confirmHandler() {
                            dl.destroy();
                            props.onRename?.(model.name)
                        }
                        return
                    }
                }

            })
        }

        watch(() => props.workflows, () => {
            if (state.activeWorkflow) {
                if (props.workflows?.includes(state.activeWorkflow)) {
                    return
                }
            }
            if (props.workflows?.length) {
                selectHandler(props.workflows![0])
            } else {
                state.activeWorkflow = undefined
            }
        }, {
            immediate: true,
        })

        function createHandler() {
            const model = reactive({
                name: ''
            })
            const dg = dialog.create({
                title: "Create new workflow",
                content() {
                    return <NInput v-model:value={model.name}></NInput>
                },
                action() {
                    return [
                        <NButton onClick={cancelHandler}>Cancel</NButton>,
                        <NButton type="primary" disabled={!model.name} onClick={confirmHandler}>Confirm</NButton>
                    ]
                },
            })

            function cancelHandler() {
                dg.destroy();
            }

            function confirmHandler() {
                dg.destroy();
                props.onCreate?.(model.name)
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
            Contextmenu,
            contextmenuHandler,
        }
    },
    render() {
        return <div class="h-full flex flex-col">
            <div class="flex-1 overflow-auto text-[var(--text-color)]">
                {
                    vFor(
                        this.$props.workflows ?? [],
                        (config) => {
                            const isActive = this.state.activeWorkflow === config
                            const classes = isActive ? ["bg-primary text-[var(--base-color)]"] : []
                            return <div
                                class={["h-12 flex items-center border-b border-[var(--border-color)] px-4 cursor-pointer", ...[classes]]}
                                onClick={() => this.selectHandler(config)}
                                onContextmenu={(e) => this.contextmenuHandler(config, e)}
                            >
                                <span>{config.title}</span>
                            </div>
                        }
                    )
                }
            </div>
            <this.Contextmenu></this.Contextmenu>
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