import { createDiscreteApi } from "naive-ui";
import { useConfigProvider } from "../hooks/configProvider";

const { dialog } = createDiscreteApi(["dialog"], {
  configProviderProps: useConfigProvider().config.value,
});

export { dialog };
