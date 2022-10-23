import { defineComponent } from "vue";
import { NInput, NImage } from "naive-ui";
import { useService, INPUT_HEIGHT, OPTION_ITEM_HEIGHT, INPUT_OPTION_GAP, INPUT_FONT_SIZE, OPTION_TITLE_FONT_SIZE, OPTION_DESC_FONT_SIZE } from "./service";
import { vIf } from "../../utils/jsxHelper";

export default defineComponent({
  setup() {
    const { state, refs, windowHeight, keyupHandler, clickHandler } = useService()

    return {
      refs,
      state,
      windowHeight,
      keyupHandler,
      clickHandler,
    }
  },
  render() {
    return <div class="h-full flex flex-col overflow-hidden" style={{
      height: `${this.windowHeight}px`
    }}>
      {/* input section */}
      <NInput
        class="bg-background"
        style={{
          height: `${INPUT_HEIGHT}px`,
          fontSize: `${INPUT_FONT_SIZE}px`,
          border: 'none',
          '--n-height': '100%',
          '--n-color-focus': 'var(--background-color)',
          '--n-border-focus': 'transparent',
          '--n-border-hover': 'transparent',
          '--n-box-shadow-focus': 'none'
        }}
        ref={this.refs.input}
        inputProps={{
          spellcheck: false,
        }}
        v-model:value={this.state.keyword}
        autofocus
        onKeyup={this.keyupHandler}
      ></NInput>
      {
        // options section
        vIf(this.state.options.length, () =>
          // options wrapper
          <div class="flex-1 overflow-auto rounded-md" style={{
            background: `var(--background-color)`,
            marginTop: `${INPUT_OPTION_GAP}px`,
            color: 'var(--text-color3)',
          }}>
            {
              this.state.options.map((opt, index) => {
                const isHint = opt.mark === 'Hint'
                const isError = opt.mark === 'Error'
                const isActive = this.state.active === index

                // option item
                return <div class="flex items-center px-2 hover:bg-[var(--hover-color)]" style={{
                  height: `${OPTION_ITEM_HEIGHT}px`,
                  background: isHint ? 'var(--warning-color)'
                    : isError ? 'var(--error-color)'
                      : isActive ? 'var(--primary-color)'
                        : undefined,
                  color: 'var(--text-color2)'
                }} onClick={e => this.clickHandler(e, index)}>

                  {/* option icon */}
                  {vIf(opt.icon, () => <NImage src={opt.icon}></NImage>)}

                  {/* option content wrapper */}
                  <div class="flex flex-col overflow-hidden cursor-default">

                    {/* option title */}
                    <div class="whitespace-nowrap overflow-hidden text-ellipsis" style={{
                      fontSize: `${OPTION_TITLE_FONT_SIZE}px`
                    }}>{opt.title}</div>

                    {/* option desc */}
                    {vIf(opt.description, () => <div class="whitespace-nowrap overflow-hidden text-ellipsis" style={{
                      fontSize: `${OPTION_DESC_FONT_SIZE}px`,
                    }}>{opt.description}</div>)}
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