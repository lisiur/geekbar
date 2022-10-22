import { createDiscreteApi } from "naive-ui";
import { useConfigProvider } from "../hooks/configProvider";

const { message } = createDiscreteApi(["message"], {
  configProviderProps: useConfigProvider().config.value,
});

export { message };
