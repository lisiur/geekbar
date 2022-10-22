import { computed, onMounted, watch, ref } from "vue";
import { useState } from "../../hooks/state";
import { NInput } from "naive-ui";
import {
  onWindowFocus,
  registerToggleWindowShortcut,
  setWindowPosition,
  setWindowSize,
} from "../../utils/window";

interface Option {
  title: string;
  desc?: string;
  args?: string;
  icon?: string;
}
export const INPUT_HEIGHT = 48;
export const OPTION_ITEM_HEIGHT = 48;
export const INPUT_OPTION_GAP = 8;
export const WINDOW_WIDTH = 560;
const MAX_OPTION_NUM = 6;

export function useService() {
  // Register shortcut
  registerToggleWindowShortcut("ALT+SPACE");

  const { state, resetState } = useState({
    keyword: "",
    options: [] as Array<Option>,
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

  // Calc window height and reset windowHeight
  const windowHeight = computed(() => {
    let height = INPUT_HEIGHT;
    if (state.options.length) {
        const visibleOptionCount = Math.min(state.options.length, MAX_OPTION_NUM);
      height +=
        INPUT_OPTION_GAP +
        OPTION_ITEM_HEIGHT * visibleOptionCount;
    }
    return height;
  });
  watch(
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

  // Auto focus input when window is focused
  onWindowFocus(() => {
    refs.input.value?.focus();
  });
  //   onWindowBlur(hideWindow);

  watch(
    () => state.keyword,
    () => {
      let n = Number(state.keyword);
      if (Number.isNaN(n)) {
        n = 0;
      }
      state.options = [...new Array(n)].map((_, index) => {
        return {
          title: `Title(#${index})`,
          desc: `Desc(#${index})`,
        };
      });
    }
  );

  return {
    state,
    refs,
    resetState,
    windowHeight,
  };
}
