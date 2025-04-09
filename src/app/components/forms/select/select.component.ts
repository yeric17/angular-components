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
import { SelectOptionComponent } from './components/select-option/select-option.component';

@Component({
  selector: 'ml-select',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, SelectOptionComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<TItem> implements OnChanges, OnInit {
  // #region component references
  listWrapper = viewChild('listWrapper', { read: ElementRef })
  // #endregion

  // #region properties
  items = model<TItem[]|undefined>(undefined)
  itemsContent = signal<TItem[]>([])
  contentItems = signal<BaseOption[]>([])
  selectedItems = signal<SelectableOption<TItem>[]>([])
  selectableItems: SelectableOption<TItem>[] = []
  activeList = signal<boolean>(false);
  protected searchValue = signal<string>('');
  protected filteredItems = signal<SelectableOption<TItem>[]>([]);

  // #endregion
  
  // #region inputs
  preSelectedItems = input<TItem[]>([])
  keyLabel = input<string>('label')
  keyValue = input<string>('value')
  placeholder = input<string>('Choose an item')
  multiple = input<boolean>(false)
  canSearch = input<boolean>(false)
  selectionTemplate = input<TemplateRef<any> | undefined>(undefined)
  optionTemplateRef = input<TemplateRef<any> | undefined>(undefined);
  // #endregion

  // #region outputs
  onSelectItems = output<TItem[]>()
  onSelectItem = output<TItem | undefined>()
  // #endregion

  protected uniqueId = this.generateUniqueId();

  // #region lifecycle
  ngOnInit(): void {
    this.initialSetup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { items } = changes;
    if (items) {
      const currentItems = this.items()
      if (!currentItems) return;
      this.setupByItems(currentItems);
    }
  }
  // #endregion

  // #region events
  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (!event.target) return;
    const target = event.target as HTMLElement;
    if (!this.listWrapper()?.nativeElement.contains(target) && this.activeList()) {
      this.setActiveList(false);
    }
  }

  itemChange(event: Event) {

    const target = event.target as HTMLInputElement;
    const value = target.value;

    const checked = target.checked;
    if (!this.multiple()) {
      for (const item of this.selectableItems) {
        item.option.checked = item.option.value == value;
      }
    }
    else {
      const item = this.selectableItems.find(item => item.option.value == value);
      if (item) {
        item.option.checked = checked;
      }
    }

    let items = this.selectableItems.filter(item => item.option.checked);

    this.setSelectedItems(items);

    let originItems = items.map(item => item.originItem);


    this.onSelectItems.emit(originItems);
    this.onSelectItem.emit(originItems[0]);



    if (!this.multiple()) {
      this.setActiveList(false);
    }
  }
  // #endregion

  // #region methods
  initialSetup() {

    const items = this.items();

    if (items) {
      this.setupByItems(items);
      return;
    }

    let selectedItems = this.selectableItems.filter(item => item.option.checked);
    this.setSelectedItems(selectedItems);

    this.resetFilteredItems();
  }

  setupByItems(items: TItem[]) {
    this.selectableItems = items
      .map<SelectableOption<TItem>>(item => {
        let option: SelectableOption<TItem> = {
          option: {
            value: this.itemValue(item),
            label: this.itemLabel(item),
            checked: false
          },
          originItem: item
        }
        if (this.multiple()) {
          option.option.checked = this.preSelectedItems().some(defaultItem => this.itemValue(defaultItem) === this.itemValue(item))
        }
        else {
          option.option.checked = this.preSelectedItems().length > 0 && this.itemValue(this.preSelectedItems()[0]) === this.itemValue(item);
        }
        return option;
      })

    let selectedItems = this.selectableItems.filter(item => item.option.checked);

    this.setSelectedItems(selectedItems);

    this.filteredItems.set([...this.selectableItems]);

    this.resetFilteredItems();
  }

  protected itemLabel(item: TItem): string {
    return (item as any)[this.keyLabel()];
  }

  protected itemValue(item: TItem): string {
    let value = (item as any)[this.keyValue()];
    return value ? value.toString() : '';
  }

  private setSelectedItems(items: SelectableOption<TItem>[]) {
    this.selectedItems.set(items);
  }

  toggleList() {
    this.setActiveList(!this.activeList());
  }

  resetFilteredItems() {
    this.filteredItems.set([...this.selectableItems]);
  }

  setActiveList(value: boolean) {
    if (!value) {
      this.searchValue.set('');
      this.resetFilteredItems();
    }

    this.activeList.set(value);
  }

  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchValue.set(value);
    
    this.filteredItems.set([...this.selectableItems.filter(item => 
      item.option.label.toLowerCase().includes(value.toLowerCase())
    )]);
    
  }

  private generateUniqueId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }
  // #endregion
}
