import { createContext, FunctionComponent, ReactNode, useRef, useContext } from 'react'
import { create, createStore, useStore, StateCreator } from 'zustand'
import { produce } from 'immer'
import { forEach, isEqual, isEqualWith, keys, omit, pick, some } from 'lodash-es'
import {
    defGetterStateType,
    optionsType,
    ExtraGetterState,
    insideActionsType,
    StoreApi
} from './types'

export function creator<
    S extends Record<string, any>,
    G extends defGetterStateType<S>,
    OptionActions extends Record<string, any>
>(
    options: optionsType<S, G, OptionActions>
): StateCreator<S & ExtraGetterState<S, G> & insideActionsType<S>> {
    function createDefState() {
        const state: any = options.state()
        forEach(options.getter, (getter, k) => {
            state[k] = getter(state)
        })
        return state as S & ExtraGetterState<S, G>
    }
    return (set, get, store) => {
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
            ...createDefState(),
            reset,
            setState: store.setState as StoreApi<S>['setState'],
            subscribe: store.subscribe,
            ...options.actions(
                get,
                { reset, setState: store.setState as StoreApi<S>['setState'] },
                store as StoreApi<S>
            )
        }
    }
}

export function defineStore<
    S extends Record<string, any>,
    G extends defGetterStateType<S>,
    OptionActions extends Record<string, any>
>(options: optionsType<S, G, OptionActions>) {
    return create(creator(options))
}

export function defineContext<
    S extends Record<string, any>,
    G extends defGetterStateType<S>,
    OptionActions extends Record<string, any>
>(options: optionsType<S, G, OptionActions>) {
    const creatorResult = creator(options)
    const $createStore = () => createStore<ReturnType<typeof creatorResult>>()(creatorResult)
    const Context = createContext<ReturnType<typeof $createStore> | null>(null)
    const Provider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
        const storeRef = useRef($createStore())
        return <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    }
    function $useContext<T>(selector: (state: ReturnType<typeof creatorResult>) => T): T {
        const store = useContext(Context)
        if (!store) throw new Error('Missing Provider in the tree')
        return useStore(store, selector)
    }

    return { Provider, useContext: $useContext }
}
