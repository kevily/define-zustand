import { produce } from 'immer'
import { forOwn, isEqual, isEqualWith, keys, pick, some } from 'lodash-es'
import { StateCreator } from 'zustand'
import {
    gettersStateType,
    optionsType,
    insideActionsType,
    modelStateType,
    stateType
} from './types'

export function storeMiddleware<
    S extends Record<string, any>,
    G extends gettersStateType<S>,
    Actions extends Record<string, any>
>(options: optionsType<S, G, Actions>): StateCreator<modelStateType<S, G, Actions>> {
    return (set, get, store) => {
        const state: any = options.state()
        forOwn(options.getters, (getter, k) => {
            state[k] = getter(state)
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
                forOwn(options.getters, (getter, k) => {
                    const current = getter(normalState)
                    if (isEqual(newGetterState[k], current)) {
                        return
                    }
                    newGetterState[k] = current
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
        const reset: insideActionsType<S>['reset'] = () => {
            set(() => options.state() as never)
        }

        return {
            ...(state as stateType<S, G>),
            reset,
            setState: store.setState,
            subscribe: store.subscribe,
            ...options.actions(get, { reset, setState: store.setState }, store)
        }
    }
}
