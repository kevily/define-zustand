import { createContext, FunctionComponent, ReactNode, useRef, useContext } from 'react'
import { create, createStore, useStore } from 'zustand'
import { Options } from './types'
import { storeMiddleware } from './store-middleware'

export function defineStateFactory<
    S extends Record<string, any>,
    G extends Record<string, any>,
    Actions extends Record<string, any>
>(options: Options<S, G, Actions>) {
    return () => options
}

export function defineStore<
    S extends Record<string, any>,
    G extends Record<string, any>,
    Actions extends Record<string, any>
>(options: Options<S, G, Actions>) {
    return create(storeMiddleware(options))
}

export function defineQuery<F extends (params: any) => any>(options: {
    queryFn: F
    params: Parameters<F>[0]
}) {
    return defineStore({
        state: () => ({
            params: options.params,
            loading: false,
            data: void 0 as Awaited<ReturnType<F>> | undefined,
            error: void 0 as Error | undefined
        }),
        getters: () => ({}),
        actions: (setState, getState) => {
            async function fetchData(params: typeof options.params) {
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
                    return data
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
            async function refetch(params?: Partial<typeof options.params>) {
                const state = getState()
                await options.queryFn({ ...state.params, ...params })
            }
            return { fetchData: fetchData as F, refetch }
        }
    })
}
export function defineContext<
    S extends Record<string, any>,
    G extends Record<string, any>,
    Actions extends Record<string, any>
>(options: Options<S, G, Actions>) {
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
