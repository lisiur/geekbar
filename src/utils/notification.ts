import { createDiscreteApi } from "naive-ui";
import { useConfigProvider } from "../hooks/configProvider";

const { notification } = createDiscreteApi(["notification"], {
  configProviderProps: useConfigProvider().config.value,
});

export { notification };
