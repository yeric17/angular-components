export interface SelectableOption<T> {
    originItem: T
    option:SelectOption
}

export interface SelectOption {
    value: string
    label: string
    checked: boolean
}

export interface BaseOption {
    value: string
    label: string
}