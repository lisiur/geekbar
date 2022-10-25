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

export function vCase<T>(...branches: Array<[cond: any, vnode: () => T]>) {
  for (const [cond, vnode] of branches) {
    if (cond) {
      return vnode()
    }
  }
  return null
}

export function vMatch<T>(...branches: Array<[cond: any, vnode: () => T]>) {
  const nodes = []
  for (const [cond, vnode] of branches) {
    if (cond) {
      nodes.push(vnode())
    }
  }
  return nodes
}