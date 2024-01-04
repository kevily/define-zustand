# define-zustand

> Quickly define [zustand](https://github.com/pmndrs/zustand) state

## Install

```shell
pnpm i define-zustand
npm i define-zustand
```

## Use

```tsx
import { defineStore, defineContext, defineStateFactory } from 'define-zustand'

const stateFatory = defineStateFactory({
    state: () => ({
        a: 1,
        b: 1
    }),
    action: () => ({}),
    getter: {
        count: state => state.a + state.b
    }
}) 
/**
 * @return zustand hooks
 */
const useStore = defineStore(stateFatory())
const { Provider, useContext } = defineContext(stateFatory())

function Child() {
    const count = useContext(state => state.count)
    return <div>{count}</div>
}
function ReactComponent() {
    const count = useStore(state => state.count)
    const setState = useStore(state => state.setState)
    const reset = useStore(state => state.reset)

    useEffect(() => {
        return () => {
            reset()
        }
    }, [])

    return (
        <Provider>
            <div>
                <button onClick={() => setState({ a: 2 })}>setA</button>
                <button
                    onClick={() =>
                        setState(state => {
                            state.b += 1
                        })
                    }>
                    setB
                </button>
                <div>{count}</div>
            </div>
            <Child />
        </Provider>
    )
}
```
