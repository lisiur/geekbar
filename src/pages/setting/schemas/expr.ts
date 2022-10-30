import { JSONPath } from 'jsonpath-plus'

export type Expr = {
  And: Array<Expr>,
} | {
  Or: Array<Expr>,
} | {
  Gt: [Expr, Expr],
} | {
  Lt: [Expr, Expr],
} | {
  Eq: [Expr, Expr],
} | {
  Ne: [Expr, Expr],
} | {
  If: [Expr, Expr, Expr],
} | string  | boolean | number

function bool(value?: string | boolean | number | null) {
    if (value === undefined || value === null) {
        return false
    } else if (typeof value === 'boolean') {
        return value
    } else if (typeof value === 'number') {
        return value === 0 ? false : true
    } else if (typeof value === 'string') {
        return value.length === 0 ? false : true
    } else {
        return false
    }
}

export function evalExprToBool(model: any, expr?: Expr): boolean {
    return bool(evalExpr(model, expr))
}

export function evalExpr(model: any, expr?: Expr): string | boolean | number | null | undefined {
    if (expr === undefined) {
        return undefined
    }
    if (typeof expr === 'object') {
        if ('And' in expr) {
            for (let e of expr.And) {
                let value = bool(evalExpr(model, e))
                if (!value) {
                    return false
                }
            }
            return true
        } else if ('Or' in expr) {
            for (let e of expr.Or) {
                let value = bool(evalExpr(model, e))
                if (value) {
                    return true
                }
            }
            return false
        } else if ('Gt' in expr) {
            let [s1, s2] = expr.Gt.map(e => evalExpr(model, e))
            let [n1, n2] = [Number(s1), Number(s2)]
            if (Number.isNaN(n1) || Number.isNaN(n2)) {
                return false
            } else {
                return n1 > n2
            }
        } else if ('Lt' in expr) {
            let [s1, s2] = expr.Lt.map(e => evalExpr(model, e))
            let [n1, n2] = [Number(s1), Number(s2)]
            if (Number.isNaN(n1) || Number.isNaN(n2)) {
                return false
            } else {
                return n1 < n2
            }
        } else if ('Eq' in expr) {
            let [s1, s2] = expr.Eq.map(e => evalExpr(model, e))
            return s1 === s2
        } else if ('Ne' in expr) {
            let [s1, s2] = expr.Ne.map(e => evalExpr(model, e))
            return s1 !== s2
        } else if ('If' in expr) {
            let [cond, then, other] = expr.If.map(e => evalExpr(model, e))
            if (bool(cond)) {
                return then
            } else {
                return other
            }
        } else {
            return false
        }
    } else {
        if (typeof expr === 'string' && expr.startsWith('$')) {
            return JSONPath({path: expr, json: model})?.[0] ?? undefined
        } else {
            return expr
        }
    }
}