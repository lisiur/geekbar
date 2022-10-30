import { defineComponent, nextTick, reactive, ref } from "vue";
import { NDropdown, DropdownProps } from 'naive-ui'

type ArrayItem<T extends Array<any>> = T extends Array<infer U> ? U : never
type DropdownOption = ArrayItem<Exclude<DropdownProps['options'], undefined>>

function getMouseOffset(e: MouseEvent) {
    const target = e.target as HTMLElement
    return {
        x: target.offsetLeft + e.offsetX,
        y: target.offsetTop + e.offsetY,
    }
}

export function useContextmenu() {
    const showContextmenu = ref(false)
    const contextmenuPos = reactive({
        x: 0,
        y: 0,
    })
    const contextmenuOptions = ref<Array<any>>([])
    let selectMenuHandler = ref((key: string) => { hide() })

    function show(e: MouseEvent, options: Array<DropdownOption>, handler: (key: string) => void) {
        const pos = getMouseOffset(e)
        contextmenuPos.x = pos.x
        contextmenuPos.y = pos.y
        selectMenuHandler.value = (key: string) => {
            handler(key)
            hide()
        }
        showContextmenu.value = false
        nextTick(() => {
            contextmenuOptions.value = options
            showContextmenu.value = true
        })
    }

    function hide() {
        showContextmenu.value = false
    }

    const Contextmenu = defineComponent({
        name:"Contextmenu",
        render() {
            return <NDropdown
                placement="bottom-start"
                trigger="manual"
                x={contextmenuPos.x}
                y={contextmenuPos.y}
                show={showContextmenu.value}
                options={contextmenuOptions.value}
                onClickoutside={hide}
                onSelect={selectMenuHandler.value}
            ></NDropdown>
        }
    })

    return {
        Contextmenu,
        show,
        hide,
    }
}