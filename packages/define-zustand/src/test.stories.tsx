import { defineStore } from './utils'
import type { Meta, StoryObj } from '@storybook/react'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta = {
    title: 'define-zustand',
    component: () => null,
    argTypes: {
        backgroundColor: { control: 'color' }
    }
}

export default meta

type Story = StoryObj

const useStore = defineStore({
    state: () => ({
        count: 0
    }),
    getter: {
        a: state => state.count + 1
    },
    actions: () => ({})
})

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    render: () => {
        const a = useStore(state => state.a)
        const setState = useStore(state => state.setState)
        return (
            <>
                <button
                    onClick={() => {
                        setState(state => {
                            state.count += 1
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
