import type {Directive} from 'vue'

export const vAutofocus: Directive<HTMLElement> = {
    mounted(el) {
        el.focus();
    }
}