import { StoreApi as ZStoreApi, ExtractState as ZExtractState } from 'zustand'

export type gettersStateType<S> = Record<string, (state: S) => any>

export type ExtraGettersState<G extends gettersStateType<any>> = {
    [key in keyof G]: ReturnType<G[key]>
}
export type stateType<S, G extends gettersStateType<any>> = S & ExtraGettersState<G>
export type StoreApi<S> = Omit<ZStoreApi<S>, 'setState'> & {
    setState: (updater: ((state: S) => void) | Partial<S>, replace?: boolean) => void
}
export type ExtractState<S> = ZExtractState<S>

export interface insideActionsType<S> {
    reset: () => void
    setState: StoreApi<S>['setState']
    subscribe: StoreApi<S>['subscribe']
}
export type actionsType<S, G extends gettersStateType<any>, OptionAction> = (
    getState: () => stateType<S, G> & OptionAction,
    actions: Omit<insideActionsType<S>, 'subscribe'>,
    store: StoreApi<S>
) => OptionAction

export interface optionsType<S, G extends gettersStateType<any>, Actions> {
    state: () => S
    getters: G
    actions: actionsType<S, G, Actions>
}

export type modelStateType<S, G extends gettersStateType<any>, Actions> = stateType<S, G> &
    Actions &
    insideActionsType<S>
