import { GlobalThemeOverrides } from "naive-ui";
import { computed, watch } from "vue";
import themes from "../theme";
import { getCurrentTheme } from "../utils/window";
import { useAsyncState } from "@vueuse/core";

const defaultTheme = {
  light: "defaultLight",
  dark: "defaultDark",
};

const { state: themeName } = useAsyncState(
  getCurrentTheme().then((theme) => defaultTheme[theme ?? "light"]),
  "defaultLight"
);
const theme = computed(() => {
  return themes[themeName.value];
});
watch(
  theme,
  () => {
    setThemeVars(theme.value.vars);
  },
  {
    immediate: true,
  }
);
const themeOverrides = computed(() => {
  return {
    common: theme.value.vars,
  } as GlobalThemeOverrides;
});

function camelToKebabCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function setThemeVar(key: string, val: string) {
  key = camelToKebabCase(key);
  if (!key.startsWith("--")) {
    key = "--" + key;
  }
  document.documentElement.style.setProperty(key, val);
}

function setThemeVars(vars: Record<string, string | undefined>) {
  Object.entries(vars).forEach(([key, val]) => {
    if (val) {
      setThemeVar(key, val);
    }
  });
}

function changeTheme(theme: string) {
  themeName.value = theme;
}

export function useTheme(defaultTheme?: string) {
  themeName.value = defaultTheme ?? themeName.value;

  return {
    theme,
    themeOverrides,
    changeTheme,
  };
}
