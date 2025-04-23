export interface TextEditor {
    content: string
    tags: any[]
}

export interface Tag {
    id: string
    name: string
    data?: any
}


export interface TextEditorItem {
    // id: string;
    type: TextEditorItemType;
    content?: TextEditorItemData
    childs?: TextEditorItem[]
}

export interface TextEditorItemData {
    text: string
    tag?: Tag
}

export type TextEditorItemType = "text" | "tag" | "paragraph"

export interface TextEditorCommand {
    name:string
    command: (callback: () => void) => void
    shouldExecute: (event:KeyboardEvent) => boolean
}

export class EditorStateMachine {
    states: IEditorState[] = [];
    currentState: IEditorState | null = null;
    constructor(states:IEditorState[], initialState:IEditorState) {
        this.states = states;
        this.currentState = initialState;
        this.currentState.onEnter(this);
    }

    changeState(newState: IEditorState) {
        if(newState.name === this.currentState?.name) {
            return;
        }

        if (this.currentState) {
            this.currentState.onExit(this);
        }
        this.currentState = newState;
        this.currentState.onEnter(this);
    }

    changeStateByName(name: string) {
        const newState = this.getState(name);
        if (newState) {
            this.changeState(newState);
        }
    }

    update() {
        if (this.currentState) {
            this.currentState.onType(this);
        }
    }

    getState(name: string): IEditorState | null {
        return this.states.find(state => state.name === name) || null;
    }

    getCurrentState(): IEditorState | null {
        return this.currentState;
    }
}

export interface IEditorState {
    name: string
    onEnter: (editorStateMachine: EditorStateMachine) => void
    onExit: (editorStateMachine: EditorStateMachine) => void
    onType: (editorStateMachine: EditorStateMachine) => void
}

