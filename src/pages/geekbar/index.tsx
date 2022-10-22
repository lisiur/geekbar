import { defineComponent } from "vue";
import { NInput, NImage } from "naive-ui";
import { useService, INPUT_HEIGHT, OPTION_ITEM_HEIGHT, INPUT_OPTION_GAP } from "./service";
import { vIf } from "../../utils/jsxHelper";

export default defineComponent({
    setup() {
        const { state, resetState, refs, windowHeight } = useService()

        return {
            refs,
            state,
            windowHeight,
        }
    },
    render() {
        return <div class="h-full flex flex-col overflow-hidden" style={{
            height: `${this.windowHeight}px`
        }}>
            <NInput
                class="bg-background"
                style={{
                    height: `${INPUT_HEIGHT}px`,
                    fontSize: '16px',
                    border: 'none',
                    '--n-height': '100%',
                    '--n-color-focus': 'var(--background-color)',
                    '--n-border-focus': 'transparent',
                    '--n-border-hover': 'transparent',
                    '--n-box-shadow-focus': 'none'
                }}
                ref={this.refs.input}
                v-model:value={this.state.keyword}
                autofocus
            ></NInput>
            {
                vIf(this.state.options.length, () =>
                    <div class="flex-1 overflow-auto" style={{
                        background: `var(--background-color)`,
                        marginTop: `${INPUT_OPTION_GAP}px`,
                        color: 'var(--text-color3)',
                    }}>
                        {
                            this.state.options.map((opt) => {
                                return <div style={{
                                    height: `${OPTION_ITEM_HEIGHT}px`,
                                }}>
                                    {vIf(opt.icon, () => <NImage src={opt.icon}></NImage>)}
                                    <div>
                                        <div>{opt.title}</div>
                                        {vIf(opt.desc, () => opt.desc)}
                                    </div>
                                </div>
                            })
                        }
                    </div>
                )
            }
        </div>
    }
})