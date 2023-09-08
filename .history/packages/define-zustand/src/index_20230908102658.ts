import { create, StoreApi as ZStoreApi } from 'zustand'
import { combine } from 'zustand/middleware'
import { produce } from 'immer'
import { forEach, isEqual, isEqualWith, keys, omit, pick, some } from 'lodash-es'

export type StoreApi<S> = Omit<ZStoreApi<S>, 'setState'> & {
    setState: (updater: ((state: S) => void) | Partial<S>, replace?: boolean) => void
}
export interface insideActionsType<S> {
    reset: () => void
    setState: StoreApi<S>['setState']
}
export type actionsType<S, OptionAction, InsideActions = unknown> = (
    getState: () => S,
    actions: insideActionsType<S> & InsideActions,
    store: StoreApi<S>
) => OptionAction

export type defGetterStateType<S> = Record<string, (state: S) => any>

export type ExtraGetterState<S, G extends defGetterStateType<S>> = {
    [key in keyof G]: ReturnType<G[key]>
}
export interface optionsType<S, G, OptionAction> {
    state: () => S
    getter: G
    actions: actionsType<S, OptionAction>
}

export default function define<
    S extends Record<string, any>,
    G extends defGetterStateType<S>,
    OptionActions extends Record<string, any>
>(options: optionsType<S, G, OptionActions>) {
    function createDefState() {
        const state: any = options.state()
        forEach(options.getter, (getter, k) => {
            state[k] = getter(state)
        })
        return state as S & ExtraGetterState<S, G>
    }
    return create(
        combine(createDefState(), (set, get, store) => {
            // getterListener
            // ----------------------------------------------------------------------
            store.subscribe((state, prevState) => {
                const getterKeys = keys(options.getter)
                const isUpdate = isEqualWith(
                    omit(state, getterKeys),
                    omit(prevState, getterKeys),
                    (current, prev) => some(current, (v, k) => v !== prev[k])
                )
                if (isUpdate) {
                    const newGetterState: any = pick(state, getterKeys)
                    forEach(options.getter, (getter, k) => {
                        if (isEqual(newGetterState[k], getter(state))) {
                            return
                        }
                        newGetterState[k] = getter(state)
                    })
                    set(newGetterState)
                }
            })
            // actions
            // ----------------------------------------------------------------------
            store.setState = (updater, replace) => {
                const nextState = typeof updater === 'function' ? produce(updater as any) : updater

                return set(nextState as any, replace)
            }
            const reset: insideActionsType<S>['reset'] = () => {
                set(() => options.state() as never)
            }
            return {
                reset,
                setState: store.setState as StoreApi<S>['setState'],
                subscribe: store.subscribe,
                ...options.actions(
                    get,
                    { reset, setState: store.setState as StoreApi<S>['setState'] },
                    store as StoreApi<S>
                )
            }
        })
    )
}
