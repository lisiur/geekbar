import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref } from "vue";
import { NDropdown } from 'naive-ui'
import { ConfigSchema, LinkSchema } from "./types";
import { vFor, vIf } from "../../utils/jsxHelper";
import { Setting, nodeId } from "./lib/setting";
import "./lib/setting.css"
import { useContextmenu } from "./contextmenu";

const props = {
    config: {
        type: Object as PropType<ConfigSchema>
    }
}

export default defineComponent({
    props,
    setup(props) {
        const rootDom = ref<HTMLElement | null>(null)

        const nodes = reactive(props.config?.nodes ?? [])

        let setting!: Setting;
        onMounted(() => {
            setting = new Setting(rootDom.value!, props.config!)
        })

        const { Contextmenu, show: showContextmenu } = useContextmenu()

        function nodeContextmenuHandler(e: MouseEvent) {
            e.preventDefault();
            showContextmenu(e, [{
                key: "node:config",
                label: "Config",
            }, {
                key: "node:delete",
                label: "Delete",
            }], (key) => {
                alert(key)
            })
        }

        return {
            rootDom,
            nodes,
            showContextmenu,
            Contextmenu,
            nodeContextmenuHandler,
        }
    },
    render() {
        return <div ref="rootDom" class="relative">
            {
                vFor(this.nodes, (node) => <div
                    class="setting-node w-28 h-12 border absolute"
                    id={nodeId(node.id)}
                    style={{
                        left: node.x + 'px',
                        top: node.y + 'px',
                    }}
                    onContextmenu={this.nodeContextmenuHandler}
                >{node.type}</div>)
            }
            <this.Contextmenu></this.Contextmenu>
        </div>
    }
})