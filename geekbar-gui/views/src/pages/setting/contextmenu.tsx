import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import { NDropdown, DropdownProps } from 'naive-ui'

type ArrayItem<T extends Array<any>> = T extends Array<infer U> ? U : never
type DropdownOption = ArrayItem<Exclude<DropdownProps['options'], undefined>>

export function useContextmenu() {
    const showContextmenu = ref(false)

    const contextmenuPos = reactive({
        x: 0,
        y: 0,
    })
    const contextmenuOptions = ref<Array<any>>([])
    let selectMenuHandler = ref((key: string) => { hide() })

    function show(e: MouseEvent, options: Array<DropdownOption>, handler: (key: string) => void) {
        contextmenuPos.x = e.x
        contextmenuPos.y = e.y
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
        name: "Contextmenu",
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