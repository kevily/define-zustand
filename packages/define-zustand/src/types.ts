import { StoreApi as ZStoreApi, ExtractState as ZExtractState } from 'zustand'

export type State<S, G> = S & G
export type StoreApi<S> = Omit<ZStoreApi<S>, 'setState'> & {
    setState: (updater: ((state: S) => void) | Partial<S>, replace?: boolean) => void
}
export type ExtractState<S> = ZExtractState<S>

export interface InsideActions<S> {
    reset: () => void
    setState: StoreApi<S>['setState']
    subscribe: StoreApi<S>['subscribe']
}
export type Actions<S, G, OptionAction> = (
    setState: InsideActions<S>['setState'],
    getState: () => State<S, G> & InsideActions<S>,
    store: StoreApi<S>
) => OptionAction

export interface Options<S, G, A> {
    state: () => S
    getters: (state: S) => G
    actions: Actions<S, G, A>
}

export type ModelState<S, G, A> = State<S, G> & A & InsideActions<S>
