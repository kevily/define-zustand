import { defineStore } from '.'
import type { Meta, StoryObj } from '@storybook/react'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta = {
    title: 'define-zustand',
    component: () => null
}

export default meta

type Story = StoryObj

const useStore = defineStore({
    state: () => ({
        count: 0,
        count2: 0
    }),
    getters: {
        a: state => state.count + 1,
        b: state => state.count2 + 2
    },
    actions: (setState, getState, store) => ({
        test: () => getState()
    })
})

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Demo: Story = {
    render: () => {
        const a = useStore(state => state.a)
        const b = useStore(state => state.b)
        const setState = useStore(state => state.setState)
        const test = useStore(state => state.test)

        console.log('a', a)
        console.log('b', b)
        console.log('test', test())
        return (
            <>
                <button
                    onClick={() => {
                        setState(state => {
                            state.count += 1
                            state.count2 += 1
                        })
                        setState(state => {
                            state.count2 += 1
                        })
                    }}
                >
                    +
                </button>
                <div>{a}</div>
            </>
        )
    }
}
