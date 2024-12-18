import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, input, OnChanges, output, signal, SimpleChanges, TemplateRef, viewChild } from '@angular/core';
import { SelectableOption } from './models/select.models';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  schemas: []
})
export class SelectComponent<TItem> implements OnChanges {
  listWrapper = viewChild('listWrapper',{read: ElementRef})

  items = input.required<TItem[]>()
  selectedItems = signal<SelectableOption<TItem>[]>([])
  filteredItems:SelectableOption<TItem>[] = []
  selectableItems = signal<SelectableOption<TItem>[]>([])
  preSelectedItems = input<TItem[]>([])
  keyLabel = input<string>('label')
  keyValue = input<string>('value')
  multiple = input<boolean>(false)

  selectionTemplate = input<TemplateRef<TItem>>()
  itemTemplate = input<TemplateRef<TItem>>()

  OnSelectItem = output<TItem[]>()

  protected uniqueId = this.GenerateUniqueId();
  protected activeList = signal<boolean>(true);

  ngOnChanges(changes: SimpleChanges): void {
    const { items } = changes;
    if (items) {
      this.InitialSetup();
    }
  }

  @HostListener('document:mouseup', ['$event'])
  OnDocumentMouseUp(event: MouseEvent): void {
    if (!event.target) return;
    const target = event.target as HTMLElement;
    if (!this.listWrapper()?.nativeElement.contains(target) && this.activeList()) {
      this.activeList.set(false);
    }
  }

  InitialSetup() {
    
    this.selectableItems.update(items => {
      items = this.items().map<SelectableOption<TItem>>(item => {
        let option: SelectableOption<TItem> = {
          option: {
            value: this.ItemValue(item),
            label: this.ItemLabel(item),
            checked: false,
            show: true
          },
          originItem: item
        }
        if(this.multiple()){
          option.option.checked = this.preSelectedItems().some(defaultItem => this.ItemValue(defaultItem) === this.ItemValue(item))
        }
        else {
          option.option.checked = this.preSelectedItems().length > 0 && this.ItemValue(this.preSelectedItems()[0]) === this.ItemValue(item);
        }
        return option;
      })
      return items;
    })

    let selectedItems = this.selectableItems().filter(item => item.option.checked);
    this.SetSelectedItems(selectedItems);

    this.filteredItems = this.selectableItems();

  }

  protected ItemLabel(item: TItem): string {
    return (item as any)[this.keyLabel()];
  }

  protected ItemValue(item: TItem): string {
    return (item as any)[this.keyValue()];
  }

  private SetSelectedItems(items: SelectableOption<TItem>[]) {
    this.selectedItems.set(items);
  }

  ItemChange(event: Event) {

    const target = event.target as HTMLInputElement;
    const value = target.value;

    if(!this.multiple()) {
      for (const items of this.filteredItems) {
        items.option.checked = items.option.value == value;
      }
    }

    let items = this.selectableItems().filter(item => item.option.checked);

    this.SetSelectedItems(items);

    let originItems = items.map(item => item.originItem);
    this.OnSelectItem.emit(originItems);
  
  }

  ToggleList() {
    this.activeList.set(!this.activeList());
  }

  Search(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    let items = this.selectableItems().map(item => {
        item.option.show = item.option.label.toLowerCase().includes(value.toLowerCase());
        return item;
    })

    this.filteredItems = items;
  }

  public UnselectItem(item: TItem) {
    this.selectableItems.update(items => {
      items = items.map(currentItem => {
        let originItem = currentItem.originItem as any;
        let passedItem = item as any;
        if (originItem[this.keyValue()] == passedItem[this.keyValue()]) {
          currentItem.option.checked = false;
        }
        return currentItem;
      })
      return items;
    })

    let selectedItems = this.selectableItems().filter(item => item.option.checked);
    this.SetSelectedItems(selectedItems);

    this.filteredItems = this.selectableItems();


    this.OnSelectItem.emit(selectedItems.map(item => item.originItem));
  }

  private GenerateUniqueId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }
}
