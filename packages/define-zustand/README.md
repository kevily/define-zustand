# define-zustand
> Quickly define [zustand](https://github.com/pmndrs/zustand) state

## Install
```shell
pnpm i define-zustand
npm i define-zustand
```

## Use
```tsx
import defineStore from 'define-zustand'

/**
 * @return zustand hooks
 */
const useStore = defineStore({
    state: () => ({
        a: 1,
        b: 1
    }),
    action: () => ({}),
    getter: {
        count: state => state.a + state.b 
    }
})
function ReactComponent() {
    const { count, setState, reset } = useStore(state => ({
        count: state.count,
        setState: state.setState,
        reset: state.reset
    }))

    useEffect(() => {
        return () => {
            reset()
        }
    }, []);
    
    return <div>
        <button onClick={() => setState({ a: 2 })}>setA</button>
        <button onClick={() => setState(state => {state.b += 1})}>setB</button>
        <div>{count}</div>
    </div>
}
```
