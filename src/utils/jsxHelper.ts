import { ComputedRef, Ref } from "vue";

export function vIf(cond: any, vnode: () => any) {
  if (cond) {
    return vnode();
  } else {
    return null;
  }
}

export function vIfElse(cond: any, thenVnode: () => any, elseVnode: () => any) {
  if (cond) {
    return thenVnode();
  } else {
    return elseVnode();
  }
}

export function vFor<T>(
  list: Array<T> | Ref<Array<T>> | ComputedRef<Array<T>>,
  mapper: (item: T) => any
) {
  if ("value" in list) {
    return list.value.map((item) => mapper(item));
  } else {
    return list.map((item) => mapper(item));
  }
}

export function vCase(...branches: Array<[cond: any, vnode: () => any]>) {
  for (const [cond, vnode] of branches) {
    if (cond) {
      return vnode();
    }
  }
  return null;
}

export function vMatch(...branches: Array<[cond: any, vnode: () => any]>) {
  const nodes = [];
  for (const [cond, vnode] of branches) {
    if (cond) {
      nodes.push(vnode());
    }
  }
  return nodes;
}
