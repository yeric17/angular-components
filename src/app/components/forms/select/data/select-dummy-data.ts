import { TextEditorData } from "../../data-tag-text-editor/models/text-editor-model";

export interface ExampleModel {
    id: number;
    name: string;
}



export const getExampleModelItems = (count: number): ExampleModel[] => {
    const items: ExampleModel[] = [];
    for (let i = 1; i <= count; i++) {
        items.push({
            id: i,
            name: `Item ${i}`,
        });
    }
    return items;
}

export const editorDataDummy: TextEditorData[] = [
    {
        items: [
            { type: "text", content: "hola " },
            {
                type: "tag",
                content: "John Doe",
                tag: {
                    id: "1",
                    name: "John Doe",
                    data: {
                        email: "john.doe@example.com",
                        phone: "+1 555-123-4567"
                    }
                }
            },
            { type: "text", content: " como va todo " },
            {
                type: "tag",
                content: "Carlos Rodriguez",
                tag: {
                    id: "3",
                    name: "Carlos Rodriguez",
                    data: {
                        email: "carlos.rodriguez@example.com",
                        phone: "+1 555-345-6789"
                    }
                }
            },
            { type: "text", content: " que esta pasando " },
            {
                type: "tag",
                content: "Maria Garcia",
                tag: {
                    id: "4",
                    name: "Maria Garcia",
                    data: {
                        email: "maria.garcia@example.com",
                        phone: "+1 555-456-7890"
                    }
                }
            },
            { type: "text", content: " claro que si " },
            {
                type: "tag",
                content: "Maria Garcia",
                tag: {
                    id: "4",
                    name: "Maria Garcia",
                    data: {
                        email: "maria.garcia@example.com",
                        phone: "+1 555-456-7890"
                    }
                }
            }
        ]
    },
    {
        items: [],
    },
    {
        items: [],
    },
    {
        items: [
            { type: "text", content: "hola " },
            {
                type: "tag",
                content: "John Doe",
                tag: {
                    id: "1",
                    name: "John Doe",
                    data: {
                        email: "john.doe@example.com",
                        phone: "+1 555-123-4567"
                    }
                }
            },
            { type: "text", content: " como va todo " },
            {
                type: "tag",
                content: "Carlos Rodriguez",
                tag: {
                    id: "3",
                    name: "Carlos Rodriguez",
                    data: {
                        email: "carlos.rodriguez@example.com",
                        phone: "+1 555-345-6789"
                    }
                }
            },
            { type: "text", content: " que esta pasando " },
            {
                type: "tag",
                content: "Maria Garcia",
                tag: {
                    id: "4",
                    name: "Maria Garcia",
                    data: {
                        email: "maria.garcia@example.com",
                        phone: "+1 555-456-7890"
                    }
                }
            },
            { type: "text", content: " claro que si " },
            {
                type: "tag",
                content: "Maria Garcia",
                tag: {
                    id: "4",
                    name: "Maria Garcia",
                    data: {
                        email: "maria.garcia@example.com",
                        phone: "+1 555-456-7890"
                    }
                }
            }
        ]
    },
];