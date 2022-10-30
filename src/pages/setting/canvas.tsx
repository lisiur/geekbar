import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref } from "vue";
import { NDropdown } from 'naive-ui'
import { ConfigSchema, LinkSchema, schemas } from "./schemas";
import { vFor, vIf } from "../../utils/jsxHelper";
import { Setting, nodeId } from "./lib/setting";
import "./lib/setting.css"
import { useContextmenu } from "./contextmenu";
import { useConfigDialog } from "./configDialog";
import { cloneDeep } from "lodash-es";

const props = {
    config: {
        type: Object as PropType<ConfigSchema>
    }
}

export default defineComponent({
    name: "Canvas",
    props,
    setup(props) {
        const rootDom = ref<HTMLElement | null>(null)

        const nodes = reactive(props.config?.nodes ?? [])

        let setting!: Setting;
        onMounted(() => {
            setting = new Setting(rootDom.value!, props.config!)
            setting.on('node:dblclick', ({ node }) => configNodeHandler(node.id))
        })

        const { Contextmenu, show: showContextmenu } = useContextmenu()
        const { ConfigDialog, show: showConfigDialog } = useConfigDialog()

        function nodeContextmenuHandler(nodeId: string, e: MouseEvent) {
            e.preventDefault();
            showContextmenu(e, [{
                key: "node:config",
                label: "Config",
            }, {
                key: "node:delete",
                label: "Delete",
            }], async (key) => {
                if (key === 'node:config') {
                    configNodeHandler(nodeId)
                }
            })
        }

        function configNodeHandler(nodeId: string) {
            const settingNode = setting.getNode(nodeId)
            const nodeType = settingNode.type
            const config = settingNode.config;
            const formSchema = schemas[nodeType]
            const model = cloneDeep(config)
            if (formSchema) {
                showConfigDialog({
                    title: nodeType,
                    model,
                    formSchema,
                }).then(() => {
                })
            } else {
                alert(`${nodeType} has no schema`)
            }
        }


        return {
            rootDom,
            nodes,
            showContextmenu,
            Contextmenu,
            nodeContextmenuHandler,
            ConfigDialog,
        }
    },
    render() {
        return <div>
            <div ref="rootDom" class="relative">
                {
                    vFor(this.nodes, (node) => <div
                        class="setting-node w-28 h-12 border absolute select-none"
                        id={nodeId(node.id)}
                        style={{
                            left: node.x + 'px',
                            top: node.y + 'px',
                        }}
                        onContextmenu={(e) => this.nodeContextmenuHandler(node.id, e)}
                    >{node.type}</div>)
                }
                <this.Contextmenu></this.Contextmenu>
            </div>
            <this.ConfigDialog></this.ConfigDialog>
        </div>
    }
})