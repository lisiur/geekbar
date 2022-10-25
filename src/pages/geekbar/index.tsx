import { defineComponent } from "vue";
import { NImage, NIcon } from "naive-ui";
import { useService, INPUT_HEIGHT, OPTION_ITEM_HEIGHT, INPUT_OPTION_GAP, INPUT_FONT_SIZE, OPTION_TITLE_FONT_SIZE, OPTION_DESC_FONT_SIZE } from "./service";
import { vIf, vMatch } from "../../utils/jsxHelper";
import {
  ExclamationTriangle as WarningIcon,
  ExclamationCircle as ErrorIcon,
  AngleRight as DefaultIcon,
} from "@vicons/fa"

export default defineComponent({
  setup() {
    const { state, refs, windowHeight, keydownHandler, clickHandler } = useService()

    return {
      refs,
      state,
      windowHeight,
      keydownHandler,
      clickHandler,
    }
  },
  render() {
    return <div class="h-full flex flex-col overflow-hidden" style={{
      height: `${this.windowHeight}px`
    }}>
      {/* input section */}
      <div class="p-2 bg-background rounded-md" style={{
        height: `${INPUT_HEIGHT}px`,
      }}>
        <input
          ref={this.refs.input}
          class="h-full w-full px-2 bg-transparent focus:bg-[var(--input-focus-color)] shadow-md outline-none"
          style={{
            fontSize: `${INPUT_FONT_SIZE}px`,
            color: 'var(--text-color2)'
          }}
          v-model={this.state.keyword}
          onKeydown={this.keydownHandler}
          spellcheck={false}
        ></input>
        {/* <NInput
          class="h-full shadow-md"
          style={{
            fontSize: `${INPUT_FONT_SIZE}px`,
            '--n-height': '100%',
            '--n-color': 'var(--background-color)',
            '--n-color-focus': 'var(--input-focus-color)',
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
          onKeyup={this.keydownHandler}
        ></NInput> */}
      </div>
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
                  background: isActive ? 'var(--primary-color)' : undefined,
                  color: isHint ? 'var(--warning-color)' : isError ? 'var(--error-color)' : 'var(--text-color2)'
                }} onClick={e => this.clickHandler(e, index)}>

                  {/* option icon */}
                  <div class="w-12 flex justify-center items-center">
                    {vMatch(
                      [opt.icon, () => <NImage src={opt.icon}></NImage>],
                      [opt.mark === 'Hint', () => <NIcon size={24}><WarningIcon></WarningIcon></NIcon>],
                      [opt.mark === 'Error', () => <NIcon size={24}><ErrorIcon></ErrorIcon></NIcon>],
                      [!opt.mark, () => <NIcon size={24}><DefaultIcon></DefaultIcon></NIcon>],
                    )}
                  </div>

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