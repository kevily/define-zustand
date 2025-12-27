import { createContext, FunctionComponent, ReactNode, useRef, useContext } from 'react'
import { create, createStore, useStore } from 'zustand'
import { gettersStateType, optionsType } from './types'
import { storeMiddleware } from './store-middleware'

export function defineStateFactory<
    S extends Record<string, any>,
    G extends gettersStateType<S>,
    Actions extends Record<string, any>
>(options: optionsType<S, G, Actions>) {
    return () => options
}

export function defineStore<
    S extends Record<string, any>,
    G extends gettersStateType<S>,
    Actions extends Record<string, any>
>(options: optionsType<S, G, Actions>) {
    return create(storeMiddleware(options))
}

export function defineQuery<P, F extends (params: P) => any>(options: { params: P; queryFn: F }) {
    return defineStore({
        state: () => ({
            params: options.params,
            loading: false,
            data: void 0 as Awaited<ReturnType<F>> | undefined,
            error: void 0 as Error | undefined
        }),
        getters: {},
        actions: (setState, getState) => ({
            query: async (params?: Partial<P>) => {
                try {
                    const state = getState()
                    setState(state => {
                        state.loading = true
                    })
                    const newParams = { ...state.params, ...params }
                    const data = await options.queryFn(newParams)
                    setState(state => {
                        state.data = data
                        state.params = newParams
                    })
                } catch (error: any) {
                    setState(state => {
                        state.error = new Error(error.message)
                    })
                } finally {
                    setState(state => {
                        state.loading = false
                    })
                }
            }
        })
    })
}

export function defineContext<
    S extends Record<string, any>,
    G extends gettersStateType<S>,
    Actions extends Record<string, any>
>(options: optionsType<S, G, Actions>) {
    const creatorResult = storeMiddleware(options)
    const $createStore = () => createStore<ReturnType<typeof creatorResult>>()(creatorResult)
    const Context = createContext<ReturnType<typeof $createStore> | null>(null)
    const Provider: FunctionComponent<{ children?: ReactNode } & Partial<S>> = ({
        children,
        ...defaultValue
    }) => {
        const storeRef = useRef<ReturnType<typeof $createStore>>()
        if (storeRef.current === void 0) {
            storeRef.current = $createStore()
            storeRef.current.setState(defaultValue as never)
        }
        return <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    }
    function $useContext<T>(selector: (state: ReturnType<typeof creatorResult>) => T): T {
        const store = useContext(Context)
        if (!store) throw new Error('Missing Provider in the tree')
        return useStore(store, selector)
    }

    return { Provider, useContext: $useContext }
}
