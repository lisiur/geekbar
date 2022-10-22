export function vIf<T>(cond: any, vnode: () => T) {
  if (cond) {
    return vnode()
  } else {
    return null
  }
}

export function vIfElse<T>(cond: any, thenVnode: () => T, elseVnode: () => T) {
  if (cond) {
    return thenVnode()
  } else {
    return elseVnode()
  }
}
