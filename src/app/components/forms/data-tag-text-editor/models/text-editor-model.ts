export interface TextEditor {
    content: string
    tags: any[]
}

export interface Tag {
    id: string
    name: string
    data?: any
    selected: boolean
}

export interface TextEditorCommand {
    command: (callback: () => void) => void
    shouldExecute: (event:KeyboardEvent) => boolean
}