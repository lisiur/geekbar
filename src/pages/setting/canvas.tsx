import { defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from "vue";
import { ConfigSchema, NodeSchema, schemas } from "./schemas";
import { vFor, vIf } from "../../utils/jsxHelper";
import { Setting, nodeId } from "./lib/setting";
import "./lib/setting.css"
import { useContextmenu } from "./contextmenu";
import { useConfigDialog } from "./configDialog";
import { cloneDeep } from "lodash-es";
import { v4 as uuid } from 'uuid'
import { initModel } from "./configForm";

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
        const nodes = ref<Array<NodeSchema>>([])

        let setting!: Setting;
        onMounted(() => {
            watch(() => props.config, () => {
                if (setting) {
                    setting.destroy()
                }
                nodes.value = props.config!.nodes
                nextTick(() => {
                    setting = new Setting(rootDom.value!, props.config!)
                    setting.on('node:dblclick', ({ node }) => configNodeHandler(node.id))
                    setting.on('link:contextmenu', ({ link, event }) => linkContextmenuHandler(link, event))
                })

            }, {
                immediate: true,
            })
        })

        const { Contextmenu, show: showContextmenu } = useContextmenu()
        const { ConfigDialog, show: showConfigDialog } = useConfigDialog()

        function linkContextmenuHandler(link: { from: string, to: string }, e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
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
            e.stopPropagation();
            showContextmenu(e, [{
                key: "node:config",
                label: "Config",
            }, {
                key: "node:delete",
                label: "Delete",
            }], async (key) => {
                switch (key) {
                    case 'node:config': {
                        configNodeHandler(nodeId)
                        break
                    }
                    case 'node:delete': {
                        setting.removeNode(nodeId)
                        break
                    }
                }
            })
        }

        function blankContextmenuHandler(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            showContextmenu(e, [{
                key: "new:Trigger",
                label: "Trigger",
            }, {
                key: "new:ListFilter",
                label: "ListFilter",
            }], async (key) => {
                const type = key.split(':')[1]
                const schema = schemas[type]
                const config = initModel(schema)
                setting.addNode({
                    id: uuid(),
                    x: e.offsetX,
                    y: e.offsetY,
                    type,
                    config,
                })
            })
        }

        // function addNode(schema: NodeSchema) {
        //     nodes.push(schema)
        //     setting.addNode(schema)
        // }

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

        function configLinkHandler(link: { from: string, to: string }) {
            const settingLink = setting.getLink(link.from, link.to)
        }

        function deleteLinkHandler(link: { from: string, to: string }) {
            const settingLink = setting.getLink(link.from, link.to)
            setting.removeLink(link)
        }


        return {
            rootDom,
            nodes,
            showContextmenu,
            Contextmenu,
            nodeContextmenuHandler,
            blankContextmenuHandler,
            ConfigDialog,
        }
    },
    render() {
        return <div class="h-full w-full" onContextmenu={this.blankContextmenuHandler}>
            <div ref="rootDom" class="relative">
                {
                    vFor(this.nodes, (node) => <div
                        class="setting-node w-28 h-12 flex items-center justify-center border-4 border-[var(--endpoint-color)] rounded-md bg-background absolute select-none"
                        id={nodeId(node.id)}
                        key={node.id}
                        style={{
                            left: node.x + 'px',
                            top: node.y + 'px',
                        }}
                        onContextmenu={(e) => this.nodeContextmenuHandler(node.id, e)}
                    >
                        <span> {node.type} </span>
                        {vIf(
                            node.type !== 'Trigger',
                            () => <div class="setting-endpoint target-selector absolute left-0 top-[50%] translate-x-[-100%] translate-y-[-50%] w-4 h-4 rounded-l-md"></div>
                        )}
                        <div class="setting-endpoint source-selector absolute right-0 top-[50%] translate-x-[100%] translate-y-[-50%] w-4 h-4 rounded-r-md"></div>
                    </div>)
                }
                <this.Contextmenu></this.Contextmenu>
            </div>
            <this.ConfigDialog></this.ConfigDialog>
        </div>
    }
})