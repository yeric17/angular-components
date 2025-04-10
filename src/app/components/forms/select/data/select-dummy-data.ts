export interface ExampleModel {
    id: number;
    name: string;
}



export const getExampleModelItems = (count: number): ExampleModel[] => {
    const items: ExampleModel[] = [];
    for (let i = 0; i < count; i++) {
        items.push({
            id: i,
            name: `Item ${i}`,
        });
    }
    return items;
}