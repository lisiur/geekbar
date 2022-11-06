import { merge, cloneDeep } from "lodash-es";
import { reactive } from "vue";

export function useState<T extends object>(state: T) {
  const originState = cloneDeep(state);
  const _state = reactive(state);

  function resetState() {
    merge(_state, originState);
  }

  return {
    state: _state,
    resetState,
  };
}
