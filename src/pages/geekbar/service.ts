import {
  computed,
  onMounted,
  watch,
  ref,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { useState } from "../../hooks/state";
import { NInput } from "naive-ui";
import { debounce } from "lodash-es";
import {
  hideWindow,
  onWindowBlur,
  onWindowFocus,
  registerToggleWindowShortcut,
  setWindowPosition,
  setWindowSize,
  showWindow,
} from "../../utils/window";
import { invoke, event } from "@tauri-apps/api";

interface Option {
  title: string;
  description?: string;
  value: any;
  mark?: "Hint" | "Error";
  icon?: string;
  workParams: any;
}
export const INPUT_FONT_SIZE = 24;
export const OPTION_TITLE_FONT_SIZE = 20;
export const OPTION_DESC_FONT_SIZE = 14;
export const INPUT_HEIGHT = 64;
export const OPTION_ITEM_HEIGHT = 68;
export const INPUT_OPTION_GAP = 8;
export const WINDOW_WIDTH = 560;
const MAX_OPTION_NUM = 6;

export function useService() {
  // Register shortcut
  registerToggleWindowShortcut("ALT+SPACE");

  const { state, resetState } = useState({
    keyword: "",
    options: [] as Array<Option>,
    active: -1,
  });

  const refs = {
    input: ref<InstanceType<typeof NInput> | null>(null),
  };

  // Set window position
  onMounted(() => {
    setWindowPosition("top", {
      offsetY: 0.2,
    });
  });

  // Calc window height
  const windowHeight = computed(() => {
    let height = INPUT_HEIGHT;
    if (state.options.length) {
      const visibleOptionCount = Math.min(state.options.length, MAX_OPTION_NUM);
      height += INPUT_OPTION_GAP + OPTION_ITEM_HEIGHT * visibleOptionCount;
    }
    return height;
  });

  // Dynamic reset windowHeight
  onBeforeMount(() => {
    const unwatch = watch(
      windowHeight,
      () => {
        setWindowSize({
          width: WINDOW_WIDTH,
          height: windowHeight.value,
        });
      },
      {
        immediate: true,
      }
    );
    onBeforeUnmount(unwatch);
  });

  // Auto focus input when window is focused
  onBeforeMount(async () => {
    const unListen = await onWindowFocus(() => {
      refs.input.value?.focus();
      refs.input.value?.select();
    });
    onBeforeUnmount(unListen);
  });
  // onWindowBlur(hideWindow);

  // Listen show event
  onBeforeMount(async () => {
    const unListen = await event.listen("show", showWindow);
    onBeforeUnmount(unListen);
  });

  // Listen reload event
  onBeforeMount(async () => {
    const unListen = await event.listen("reload", () => {
      invoke("reload");
    });
    onBeforeUnmount(unListen);
  });

  // Listen work params
  onBeforeMount(async () => {
    const unListen = await event.listen("work_params", (event: any) => {
      const workParams = event.payload;
      const prompt = workParams.params?.prompt;
      if (!prompt) {
        execute(workParams);
      } else {
        if (prompt.type === "FuzzySelect" || prompt.type === "Select") {
          state.options = prompt.config.options.map((item: any) => {
            return {
              ...item,
              workParams,
            };
          });
          if (state.options[0]?.mark) {
            state.active = -1;
          } else {
            state.active = 0;
          }
          workParams.params.prompt = null;
        }
      }
    });
    onBeforeUnmount(unListen);
  });

  // Searching
  onBeforeMount(() => {
    const debounceSearch = debounce(search, 100);
    const unwatch = watch(
      () => state.keyword,
      () => {
        debounceSearch();
      }
    );
    onBeforeUnmount(unwatch);
  });

  function keyupHandler(e: KeyboardEvent) {
    const { code, ctrlKey, altKey, shiftKey, metaKey } = e;
    switch (code) {
      case "ArrowDown": {
        if (state.active === -1) {
          return;
        }
        state.active = (state.active + 1) % state.options.length;
        break;
      }
      case "ArrowUp": {
        if (state.active === -1) {
          return;
        }
        state.active =
          (state.active + state.options.length - 1) % state.options.length;
        break;
      }
      case "Enter": {
        if (state.active === -1) {
          return;
        }
        const option = state.options[state.active];
        if (option) {
          executeOption();
        }
        break;
      }
      case "Escape": {
        hideWindow();
        resetState();
        break;
      }
    }
  }

  function clickHandler(e: MouseEvent, index: number) {
    executeOption();
  }

  async function search() {
    const [keyword = "", ...args] = state.keyword.split(" ");
    const arg = args.join(" ");
    const triggered: boolean = await invoke("trigger", {
      triggerId: keyword,
      value: arg,
    });
    if (!triggered) {
      state.options = []
      state.active = -1
    }
  }

  async function executeOption() {
    const option = state.options[state.active];
    if (option && !option.mark) {
      execute(option.workParams, option.value);
      hideWindow();
    }
  }

  async function execute(workParams: any, value = null) {
    console.log("execute", workParams, value);
    await invoke("execute", {
      workParams,
      value,
    });
  }

  return {
    state,
    refs,
    resetState,
    windowHeight,
    keyupHandler,
    clickHandler,
  };
}
