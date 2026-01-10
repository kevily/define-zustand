import { produce } from 'immer'
import { forOwn, isEqual, isEqualWith, keys, pick, some } from 'lodash-es'
import { StateCreator } from 'zustand'
import { Options, InsideActions, ModelState } from './types'

export function storeMiddleware<
    S extends Record<string, any>,
    G extends Record<string, any>,
    Actions extends Record<string, any>
>(options: Options<S, G, Actions>): StateCreator<ModelState<S, G, Actions>> {
    return (set, get, store) => {
        const state: any = options.state()
        forOwn(options.getters(state), (getter, k) => {
            state[k] = getter
        })
        // getterListener
        // ----------------------------------------------------------------------
        store.subscribe((state, prevState) => {
            const getterKeys = keys(options.getters)
            const normalStateKeys = keys(options.state())
            const normalState = pick(state, normalStateKeys) as S
            const isUpdate = isEqualWith(
                normalState,
                pick(prevState, normalStateKeys),
                (current, prev) => some(current, (v, k) => v !== prev[k])
            )
            if (isUpdate) {
                const newGetterState: any = pick(state, getterKeys)
                forOwn(options.getters(normalState), (getterState, k) => {
                    if (isEqual(newGetterState[k], getterState)) {
                        return
                    }
                    newGetterState[k] = getterState
                })
                set(newGetterState)
            }
        })
        // actions
        // ----------------------------------------------------------------------
        store.setState = (updater, replace) => {
            const nextState = typeof updater === 'function' ? produce(updater as any) : updater

            return set(nextState, replace)
        }
        const reset: InsideActions<S>['reset'] = () => {
            set(() => options.state() as never)
        }

        return {
            ...state,
            reset,
            setState: store.setState,
            subscribe: store.subscribe,
            ...options.actions(store.setState as never, get, store as never)
        }
    }
}
