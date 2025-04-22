import { signal } from "@angular/core";
import { EditorStateMachine, IEditorState, TextEditorCommand } from "../models/text-editor-model";

export const commands = signal<TextEditorCommand[]>([
    {
        name: 'Delete',
        command: (callback) => {
            callback();
        },
        shouldExecute: (event: KeyboardEvent) => {
            return event.key === 'Delete' || event.key === 'Backspace';
        }
    },
    {
        name: 'InsertTag',
        command: (callback) => {
            callback();
        },
        shouldExecute: (event: KeyboardEvent) => {
            return event.key === '@';
        }
    },
    {
        name: 'ConfirmTag',
        command: (callback) => {
            callback();
        },
        shouldExecute: (event: KeyboardEvent) => {
            return event.key === 'Tab' || event.key === 'Enter';
        }
    },
    {
        name: 'Undo',
        command: (callback) => {
            callback();
        },
        shouldExecute: (event: KeyboardEvent) => {
            return event.ctrlKey && event.key === 'z';
        }
    }
])

export const editorStates:IEditorState[] = [
    {
        name: 'Idle',
        onEnter: (editorStateMachine: EditorStateMachine) => {
            console.log('Entering Idle State');
        },
        onExit: (editorStateMachine: EditorStateMachine) => {
            console.log('Exiting Idle State');
        },
        onType: (editorStateMachine: EditorStateMachine) => {
            console.log('Typing in Idle State');
        }
    },
    {
        name: 'searching-tag',
        onEnter: (editorStateMachine: EditorStateMachine) => {
            console.log('Entering Searching Tag State');
        },
        onExit: (editorStateMachine: EditorStateMachine) => {
            console.log('Exiting Searching Tag State');
        },
        onType: (editorStateMachine: EditorStateMachine) => {
            console.log('Typing in Searching Tag State');
        }
    },
    {
        name: 'undo-changes',
        onEnter: (editorStateMachine: EditorStateMachine) => {
            console.log('Entering undo Changes State');
        },
        onExit: (editorStateMachine: EditorStateMachine) => {
            console.log('Exiting undo Changes State');
        },
        onType: (editorStateMachine: EditorStateMachine) => {
            console.log('Typing in undo Changes State');
        }
    }
]