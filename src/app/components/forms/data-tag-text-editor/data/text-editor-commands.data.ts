import { signal } from "@angular/core";
import { TextEditorCommand } from "../models/text-editor-model";

export const commands = signal<TextEditorCommand[]>([
    {
        command: (callback) => {
            callback();
        },
        shouldExecute: (event: KeyboardEvent) => {
            return event.key === 'Delete' || event.key === 'Backspace';
        }
    }
])