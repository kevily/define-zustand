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
    actions: get => ({
        test: () => {
            console.log('1', 1)
        },
        t: () => {
            get()
        }
    })
})

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    render: () => {
        const a = useStore(state => state.a)
        const b = useStore(state => state.b)
        const setState = useStore(state => state.setState)

        console.log('a', a)
        console.log('b', b)
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
