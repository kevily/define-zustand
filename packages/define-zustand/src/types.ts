import { StoreApi as ZStoreApi } from 'zustand'

export type StoreApi<S> = Omit<ZStoreApi<S>, 'setState'> & {
    setState: (updater: ((state: S) => void) | Partial<S>, replace?: boolean) => void
}
export interface insideActionsType<S> {
    reset: () => void
    setState: StoreApi<S>['setState']
    subscribe: StoreApi<S>['subscribe']
}
export type actionsType<S, OptionAction, InsideActions = unknown> = (
    getState: () => S,
    actions: Omit<insideActionsType<S>, 'subscribe'> & InsideActions,
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
