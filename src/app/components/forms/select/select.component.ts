import { 
  ChangeDetectionStrategy, 
  Component, 
  ElementRef, 
  HostListener, 
  input, 
  OnChanges, 
  output, 
  signal, 
  SimpleChanges, 
  TemplateRef, 
  viewChild 
} from '@angular/core';
import { SelectableOption } from './models/select.models';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<TItem> implements OnChanges {
  listWrapper = viewChild('listWrapper', { read: ElementRef })

  items = input.required<TItem[]>()
  selectedItems = signal<SelectableOption<TItem>[]>([])
  selectableItems: SelectableOption<TItem>[] = []
  preSelectedItems = input<TItem[]>([])
  keyLabel = input<string>('label')
  keyValue = input<string>('value')

  multiple = input<boolean>(false)
  canSearch = input<boolean>(false)

  selectionTemplate = input<TemplateRef<TItem>>()
  itemTemplate = input<TemplateRef<TItem>>()

  OnSelectItem = output<TItem[]>()

  protected uniqueId = this.GenerateUniqueId();
  activeList = signal<boolean>(false);
  protected searchValue = signal<string>('');

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
      this.SetActiveList(false);
    }
  }

  InitialSetup() {

    this.selectableItems = this.items()
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
