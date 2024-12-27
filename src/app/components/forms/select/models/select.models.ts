export type SelectableOption<T> = {
    originItem: T
    option:SelectOption
}

export type SelectOption = {
    value: string
    label: string
    checked: boolean
    show: boolean
}

export type BaseOption = {
    value: string
    label: string
}