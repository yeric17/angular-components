import { TextEditorItem } from "../../data-tag-text-editor/models/text-editor-model";

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



export const editorDataDummy: TextEditorItem[] = [
    {
        type: "paragraph",
        childs: [
            {
                type: "text",
                content: {
                    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. con un nuevo tag ",
                },
            },
            {
                type: "tag",
                content: {
                    text: "",
                    tag: {
                        id: "2",
                        name: "Jane Smith",
                        data: {
                            email: "jane.smith@example.com",
                            phone: "+1 555-234-5678"
                        }
                    }
                }
            },
            {
                type: "text",
                content: {
                    text: " ahora tiene una nueva estructura",
                },
            }
        ]
    },
    {
        type: "paragraph",
        childs: []
    },
    {
        type: "paragraph",
        childs: []
    },
    {
        type: "paragraph",
        childs: [
            {
                type: "text",
                content: {
                    text: "que se puede moldear mas facilmente ",
                },
            },
            {
                type: "tag",
                content: {
                    text: "",
                    tag: {
                        id: "4",
                        name: "Maria Garcia",
                        data: {
                            email: "maria.garcia@example.com",
                            phone: "+1 555-456-7890"
                        }
                    }
                }
            },
            {
                type: "text",
                content: {
                    text: " con esto puedo trabajar mejor para hacer las ediciones",
                },
            }
        ]
    },
    {
        type: "paragraph",
        childs: [
            {
                type: "tag",
                content: {
                    text: "",
                    tag: {
                        id: "4",
                        name: "Maria Garcia",
                        data: {
                            email: "maria.garcia@example.com",
                            phone: "+1 555-456-7890"
                        }
                    }
                }
            }
        ]
    }
];