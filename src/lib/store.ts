// Shared state for the Vue islands and the page scripts.
// All islands import this module, so they share one instance.
import { reactive, shallowReactive } from 'vue';

// Picks from "Arma tu sistema". The contact form and Crocky read them.
export const selection = reactive({
    selected: [] as string[],
    newest: null as string | null
});

// Toggle one chip. Return true when the chip is now on.
export function toggleChip(id: string): boolean {
    const i = selection.selected.indexOf(id);
    if (i >= 0) {
        selection.selected = selection.selected.filter((x) => x !== id);
        if (selection.newest === id) {
            selection.newest = selection.selected[selection.selected.length - 1] ?? null;
        }
        return false;
    }
    selection.selected = [...selection.selected, id];
    selection.newest = id;
    return true;
}

export function clearChips(): void {
    selection.selected = [];
    selection.newest = null;
}

export interface CrockyMsg {
    text: string;
    n: number;
    // 'section': a line for a section that scrolls into view.
    // 'say': a reaction to a visitor action.
    kind: 'section' | 'say';
}

// Crocky bus. Any script can set a line. The corner island shows it.
export const crocky = shallowReactive({
    msg: null as CrockyMsg | null,
    section: '',
    // Default look target for Crocky (the newest module). Null: follow the cursor.
    aim: null as HTMLElement | null
});

let counter = 0;
export function crockySay(text: string, kind: CrockyMsg['kind'] = 'say'): void {
    crocky.msg = { text, kind, n: ++counter };
}
