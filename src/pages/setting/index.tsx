import { defineComponent, onMounted, reactive } from "vue";
import { vIf } from "../../utils/jsxHelper";
import Canvas from "./canvas"
import Explorer from "./explorer"
import { ConfigSchema } from "./schemas";
import { getAllWorkflows } from "./service";

export default defineComponent({
    name: "Setting",
    setup() {

        const state = reactive({
            activeWorkflow: undefined as undefined | ConfigSchema,
            workflows: [] as ConfigSchema[],
        })

        onMounted(() => {
            getAllWorkflows().then(workflows => {
                state.workflows = workflows
            })
        })

        function createWorkflowHandler(name: string) {

        }

        function viewWorkflowHandler(workflow: ConfigSchema) {
            state.activeWorkflow = workflow
        }

        return {
            state,
            createWorkflowHandler,
            viewWorkflowHandler,
        }
    },
    render() {
        return <div class="h-full flex">
            <div class="w-[280px] border-r">
                <Explorer
                    workflows={this.state.workflows}
                    onCreate={this.createWorkflowHandler}
                    onSelect={this.viewWorkflowHandler}
                ></Explorer>
            </div>
            <div class="flex-1">
                {
                    vIf(
                        this.state.activeWorkflow,
                        () => <Canvas config={this.state.activeWorkflow}></Canvas>
                    )
                }
            </div>
        </div>
    }
})