import { defineComponent, onMounted, reactive } from "vue";
import { vIf } from "../../utils/jsxHelper";
import { showWindow } from "../../utils/window";
import Canvas from "./canvas"
import Explorer from "./explorer"
import { ConfigSchema } from "./schemas";
import { createWorkflow, deleteWorkflow, getAllWorkflows, saveWorkflow } from "./service";

export default defineComponent({
    name: "Setting",
    setup() {

        onMounted(showWindow)

        const state = reactive({
            activeWorkflow: undefined as undefined | ConfigSchema,
            workflows: [] as ConfigSchema[],
        })

        onMounted(() => {
            getAllWorkflows().then(workflows => {
                state.workflows = workflows
            })
        })

        async function createWorkflowHandler(name: string) {
            const config_schema = await createWorkflow(name)
            state.workflows.push(config_schema)
        }

        async function deleteWorkflowHandler(workflowId: string) {
            await deleteWorkflow(workflowId)
            let index = state.workflows.findIndex(item => item.id === workflowId)
            state.workflows.splice(index ,1)
        }

        function viewWorkflowHandler(workflow: ConfigSchema) {
            state.activeWorkflow = workflow
        }

        async function saveWorkflowHandler(workflow: ConfigSchema) {
            await saveWorkflow(workflow)
        }

        return {
            state,
            createWorkflowHandler,
            viewWorkflowHandler,
            saveWorkflowHandler,
            deleteWorkflowHandler,
        }
    },
    render() {
        return <div class="h-full flex bg-background">
            <div class="w-[280px] border-r border-[var(--border-color)]">
                <Explorer
                    workflows={this.state.workflows}
                    onCreate={this.createWorkflowHandler}
                    onSelect={this.viewWorkflowHandler}
                    onDelete={this.deleteWorkflowHandler}
                ></Explorer>
            </div>
            <div class="flex-1">
                {
                    vIf(
                        this.state.activeWorkflow,
                        () => <Canvas
                            config={this.state.activeWorkflow}
                            onChanged={this.saveWorkflowHandler}
                        ></Canvas>
                    )
                }
            </div>
        </div>
    }
})