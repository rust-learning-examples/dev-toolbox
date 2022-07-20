import { defineStore } from 'pinia'

export const useApp = defineStore('app', {
  state: (): any => ({
    inputText: ''
  }),
  getters: {
    inputText: (state) => state.authInfo !== null,
  },
  actions: {
    appendInputText(inputText: string): void { this.inputText = `${this.inputText}${inputText}`},
  },
})