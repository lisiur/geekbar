import { defineComponent, onMounted, PropType, reactive, ref } from "vue";
import { ConfigSchema, schemas } from "./schemas";
import { vFor } from "../../utils/jsxHelper";
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
            setting.on('node:contextmenu', ({ node, event }) => nodeContextmenuHandler(node.id, event))
            setting.on('link:contextmenu', ({ link, event }) => linkContextmenuHandler(link, event))
        })

        const { Contextmenu, show: showContextmenu } = useContextmenu()
        const { ConfigDialog, show: showConfigDialog } = useConfigDialog()

        function linkContextmenuHandler(link: {from: string, to: string}, e: MouseEvent) {
            e.preventDefault();
            showContextmenu(e, [{
                key: "link:config",
                label: "Config",
            }, {
                key: "link:delete",
                label: "Delete",
            }], async (key) => {
                if (key === 'link:config') {
                    configLinkHandler(link)
                } else if (key === 'link:delete') {
                    deleteLinkHandler(link)
                }
            })
        }

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
                    console.log(model)
                })
            } else {
                alert(`${nodeType} has no schema`)
            }
        }

        function configLinkHandler(link: {from: string, to: string}) {
            const settingLink = setting.getLink(link.from, link.to)
        }

        function deleteLinkHandler(link: {from: string, to: string}) {
            const settingLink = setting.getLink(link.from, link.to)
            setting.removeLink(link)
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
                        class="setting-node w-28 h-12 border-4 rounded-md absolute select-none"
                        id={nodeId(node.id)}
                        style={{
                            left: node.x + 'px',
                            top: node.y + 'px',
                        }}
                    >
                        <span> {node.type} </span>
                        <div class="setting-endpoint source-selector absolute right-0 top-[50%] translate-x-[100%] translate-y-[-50%] w-4 h-4 rounded-r-md"></div>
                        <div class="setting-endpoint target-selector absolute left-0 top-[50%] translate-x-[-100%] translate-y-[-50%] w-4 h-4 rounded-l-md"></div>
                    </div>)
                }
                <this.Contextmenu></this.Contextmenu>
            </div>
            <this.ConfigDialog></this.ConfigDialog>
        </div>
    }
})