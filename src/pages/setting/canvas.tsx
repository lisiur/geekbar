import { computed, defineComponent, onMounted, PropType, reactive, ref } from "vue";
import { ConfigSchema, LinkSchema } from "./types";
import { vFor, vIf } from "../../utils/jsxHelper";
import { Setting, nodeId } from "./lib/setting";
import "./lib/setting.css"

const props = {
    config: {
        type: Object as PropType<ConfigSchema>
    }
}

export default defineComponent({
    props,
    setup(props) {
        const rootDom = ref<HTMLElement | null>(null)
        const setting = ref<Setting | null>(null)

        const nodes = reactive(props.config?.nodes ?? [])

        onMounted(() => {
            setting.value = new Setting(rootDom.value!, props.config!)
        })

        return {
            rootDom,
            nodes,
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
                    >{node.type}</div>)
            }
        </div>
    }
})