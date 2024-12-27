import { 
  ChangeDetectionStrategy, 
  Component, 
  contentChildren, 
  ElementRef, 
  HostListener, 
  input, 
  model, 
  OnChanges, 
  OnInit, 
  output, 
  signal, 
  SimpleChanges, 
  TemplateRef, 
  viewChild
} from '@angular/core';
import { BaseOption, SelectableOption } from './models/select.models';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { SelectOptionComponent } from './select-option/select-option.component';

@Component({
  selector: 'ml-select',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, SelectOptionComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<TItem> implements OnChanges, OnInit {
  listWrapper = viewChild('listWrapper', { read: ElementRef })
  
  childItemsComponent = contentChildren(SelectOptionComponent, { descendants: true});
  childItemsElement = contentChildren(SelectOptionComponent, { descendants: true, read: ElementRef });

  items = model<TItem[]|undefined>(undefined)
  contentItems = signal<BaseOption[]>([])

  selectedItems = signal<SelectableOption<TItem>[]>([])
  selectableItems: SelectableOption<TItem>[] = []
  preSelectedItems = input<TItem[]>([])
  keyLabel = input<string>('label')
  keyValue = input<string>('value')
  placeholder = input<string>('Choose an item')

  multiple = input<boolean>(false)
  canSearch = input<boolean>(false)

  selectionTemplate = input<TemplateRef<TItem>>()
  itemTemplate = input<TemplateRef<TItem>>()

  OnSelectItem = output<TItem[]>()

  protected uniqueId = this.GenerateUniqueId();
  activeList = signal<boolean>(false);
  protected searchValue = signal<string>('');

  ngOnInit(): void {
    this.InitialSetup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { items } = changes;
    if (items) {
      const currentItems = this.items()
      if (!currentItems) return;
      this.SetupByItems(currentItems);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  OnDocumentMouseUp(event: MouseEvent): void {
    if (!event.target) return;
    const target = event.target as HTMLElement;
    if (!this.listWrapper()?.nativeElement.contains(target) && this.activeList()) {
      this.SetActiveList(false);
    }
  }

  InitialSetup() {

    const items = this.items();

    if (items) {
      this.SetupByItems(items);
      return;
    }



    for(let i = 0; i < this.childItemsComponent().length; i++) {
      const item = this.childItemsComponent()[i];
      const element = this.childItemsElement()[i];
      const option: SelectableOption<TItem> = {
        option: {
          value: item.value(),
          label: element.nativeElement.textContent,
          checked: item.checked(),
          show: item.show()
        },
        originItem: {
          label: element.nativeElement.textContent,
          value: item.value()
        } as any
      }

      item.OnItemChange.subscribe((event) => this.ItemChange(event));
      item.show.set(option.option.show);
      item.checked.set(option.option.checked);
      this.selectableItems.push(option)
    }

 
    let selectedItems = this.selectableItems.filter(item => item.option.checked);
    this.SetSelectedItems(selectedItems);

    this.ResetFilteredItems();

  }

  SetupByItems(items: TItem[]) {
    this.selectableItems = items
      .map<SelectableOption<TItem>>(item => {
        let option: SelectableOption<TItem> = {
          option: {
            value: this.ItemValue(item),
            label: this.ItemLabel(item),
            checked: false,
            show: true,
          },
          originItem: item
        }
        if (this.multiple()) {
          option.option.checked = this.preSelectedItems().some(defaultItem => this.ItemValue(defaultItem) === this.ItemValue(item))
        }
        else {
          option.option.checked = this.preSelectedItems().length > 0 && this.ItemValue(this.preSelectedItems()[0]) === this.ItemValue(item);
        }
        return option;
      })


    let selectedItems = this.selectableItems.filter(item => item.option.checked);
    this.SetSelectedItems(selectedItems);

    this.ResetFilteredItems();
  }

  protected ItemLabel(item: TItem): string {
    return (item as any)[this.keyLabel()];
  }

  protected ItemValue(item: TItem): string {
    let value = (item as any)[this.keyValue()];
    return value ? value.toString() : '';
  }

  private SetSelectedItems(items: SelectableOption<TItem>[]) {
    this.selectedItems.set(items);
  }

  ItemChange(event: Event) {

    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (!this.multiple()) {
      for (const item of this.selectableItems) {
        item.option.checked = item.option.value == value;
      }
    }
    else {
      const item = this.selectableItems.find(item => item.option.value == value);
      const checked = target.checked;
      if (item) {
        item.option.checked = checked;
      }
    }

    let items = this.selectableItems.filter(item => item.option.checked);

    this.SetSelectedItems(items);

    let originItems = items.map(item => item.originItem);
    this.OnSelectItem.emit(originItems);

    if (!this.multiple()) {
      this.activeList.set(false);
    }
  }

  ToggleList() {
    this.SetActiveList(!this.activeList());
  }

  ResetFilteredItems() {
    for (const item of this.selectableItems) {
      item.option.show = true;
    }
  }

  SetActiveList(value: boolean) {
    if (!value) {
      this.searchValue.set('');
      this.ResetFilteredItems();
    }

    this.activeList.set(value);
  }

  Search(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchValue.set(value);
    for (const item of this.selectableItems) {
      item.option.show = item.option.label.toLowerCase().includes(value.toLowerCase());
    }
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
