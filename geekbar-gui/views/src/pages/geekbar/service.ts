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
import { registerLifetimeListener } from "../../utils";

interface Option {
  title: string;
  description?: string;
  value: any;
  mark?: "Hint" | "Error";
  icon?: string;
  work: any;
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
  registerLifetimeListener(() => {
    return watch(
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
  });

  registerLifetimeListener(() => {
    return onWindowFocus(() => {
      refs.input.value?.focus();
      refs.input.value?.select();
    });
  })

  registerLifetimeListener(() => {
    return onWindowBlur(hideWindow);
  })

  // Auto focus input when window is focused
  registerLifetimeListener(() => {
    return onWindowFocus(() => {
      refs.input.value?.focus();
      refs.input.value?.select();
    });
  });

  // Listen show event
  registerLifetimeListener(() => {
    return event.listen("show", showWindow);
  });

  // Listen reload event
  registerLifetimeListener(() => {
    return event.listen("reload", () => {
      invoke("reload");
    });
  });

  // Listen work params
  registerLifetimeListener(() => {
    return event.listen("work", (event: any) => {
      const work = event.payload;
      const prompt = work.params?.prompt;
      if (!prompt) {
        execute(work);
      } else {
        if (prompt.type === "FuzzySelect" || prompt.type === "Select") {
          state.options = prompt.config.options.map((item: any) => {
            return {
              ...item,
              work,
            };
          });
          if (state.options[0]?.mark) {
            state.active = -1;
          } else {
            state.active = 0;
          }
          work.params.prompt = null;
        }
      }
    });
  });

  // Searching
  registerLifetimeListener(() => {
    const debounceSearch = debounce(search, 100);
    return watch(
      () => state.keyword,
      () => {
        debounceSearch();
      }
    );
  });

  function keydownHandler(e: KeyboardEvent) {
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
        e.preventDefault()
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
      execute(option.work, option.value);
      hideWindow();
    }
  }

  async function execute(work: any, value = null) {
    console.log("execute", work, value);
    await invoke("execute", {
      work,
      value,
    });
  }

  return {
    state,
    refs,
    resetState,
    windowHeight,
    keydownHandler,
    clickHandler,
  };
}
