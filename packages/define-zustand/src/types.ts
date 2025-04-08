import { StoreApi as ZStoreApi, ExtractState as ZExtractState } from 'zustand'

export type defGetterStateType<S> = Record<string, (state: S) => any>
export type ExtraGetterState<G extends defGetterStateType<any>> = {
    [key in keyof G]: ReturnType<G[key]>
}
export type stateType<S, G extends defGetterStateType<any>> = S & ExtraGetterState<G>
export type StoreApi<S> = Omit<ZStoreApi<S>, 'setState'> & {
    setState: (updater: ((state: S) => void) | Partial<S>, replace?: boolean) => void
}
export type ExtractState<S> = ZExtractState<S>

export interface insideActionsType<S> {
    reset: () => void
    setState: StoreApi<S>['setState']
    subscribe: StoreApi<S>['subscribe']
}
export type actionsType<S, G extends defGetterStateType<any>, OptionAction> = (
    getState: () => stateType<S, G>,
    actions: Omit<insideActionsType<S>, 'subscribe'>,
    store: StoreApi<S>
) => OptionAction

export interface optionsType<S, G extends defGetterStateType<any>, Actions> {
    state: () => S
    getter: G
    actions: actionsType<S, G, Actions>
}

export type modelStateType<S, G extends defGetterStateType<any>, Actions> = stateType<S, G> &
    Actions &
    insideActionsType<S>
