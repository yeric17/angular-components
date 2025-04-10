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

const OFFSET_BOUNDING = 10;

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
  selectContainer = viewChild('selectContainer', { read: ElementRef })
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
  protected lazyIndex = signal<number>(0);
  protected verticalAlign = signal<'top' | 'bottom'>('bottom');
  protected horizontalAlign = signal<'left' | 'right'>('left');


  selectListMaxHeightPx: number = 0;
  formFieldPaddingXPx: number = 0;
  selectHeightPx: number = 0;
  selectListMinWidthPx: number = 0;
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
  size = input<'sm' | 'md' | 'lg'>('md')
  lazyLoadItemsNumber = input<number|undefined>(undefined)
  fullWidth = input<boolean>(false)
  // #endregion

  // #region outputs
  onSelectItems = output<TItem[]>()
  onSelectItem = output<TItem | undefined>()
  // #endregion

  protected uniqueId = this.generateUniqueId();

  // #region lifecycle
  ngOnInit(): void {
    this.initialSetup();

    
    if (this.listWrapper()) {
      const computedStyle = window.getComputedStyle(this.listWrapper()?.nativeElement);
      const styleVal = computedStyle.getPropertyValue('--select-list-max-height');
      const paddingXVal = computedStyle.getPropertyValue('--form-field-padding-x');
      const headerHeight = computedStyle.getPropertyValue('--select-height');
      const widthVal = computedStyle.getPropertyValue('--select-list-min-width');
      
      
      const rootSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);

      this.selectListMaxHeightPx = styleVal.endsWith('rem')
        ? parseFloat(styleVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(styleVal.replace(/rem|em|px|%/, ''));

      this.formFieldPaddingXPx = paddingXVal.endsWith('rem')
        ? parseFloat(paddingXVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(paddingXVal.replace(/rem|em|px|%/, ''));

      this.selectHeightPx = headerHeight.endsWith('rem')
        ? parseFloat(headerHeight.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(headerHeight.replace(/rem|em|px|%/, ''));

      this.selectListMinWidthPx = widthVal.endsWith('rem')
        ? parseFloat(widthVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(widthVal.replace(/rem|em|px|%/, ''));
        

    }

    const interesectionOptions = {
      root: document.body,
      rootMargin: '0px',
      threshold: 0.1
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log({entry})
        }
      });
    }, interesectionOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { items } = changes;
    if (items && !items.firstChange) {
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
    if (!this.selectContainer()?.nativeElement.contains(target) && this.activeList()) {
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

    this.updateFilteredItems();

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
    this.updateFilteredItems();
  }

  setActiveList(value: boolean) {
    if (!value) {
      this.searchValue.set('');
      this.resetFilteredItems();
    }

    if(value){
      this.updateListPosition();
    }

    this.activeList.set(value);
  }

  updateListPosition(){
    const boundingRect = this.selectContainer()?.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const distanceToBottom = viewportHeight - boundingRect.bottom;
    const distanceToRight = viewportWidth - boundingRect.right;
    const distanceToLeft = boundingRect.left;

    let listHeight = this.selectListMaxHeightPx + (this.formFieldPaddingXPx * 2) + this.selectHeightPx + OFFSET_BOUNDING;

    const selectListWidthPx = this.selectContainer()?.nativeElement.getBoundingClientRect().width;

    const availableRightSpace = viewportWidth - (distanceToLeft + this.selectListMinWidthPx);

    if(availableRightSpace < 0 && (distanceToLeft + selectListWidthPx) > this.selectListMinWidthPx){
      this.horizontalAlign.set('right')
    }

    if((distanceToBottom - listHeight) < 0) {
      this.verticalAlign.set('top');
    }
    else {
      this.verticalAlign.set('bottom');
    }
  }

  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchValue.set(value);

    this.updateFilteredItems();
    
    // this.filteredItems.set([...this.selectableItems.filter(item => 
    //   item.option.label.toLowerCase().includes(value.toLowerCase())
    // )]);
  }

  updateFilteredItems(){
    if(this.searchValue().trim() != ''){
      this.filteredItemsWithSearch();
    }
    else{
      this.filteredItems.set(this.getSelectableItems());
    }
  }

  filteredItemsWithSearch(){
    this.filteredItems.set([...this.getSelectableItems().filter(item =>
      item.option.label.toLowerCase().includes(this.searchValue().toLowerCase())
    )]);
  }

  getSelectableItems(){
    let baseItems = [] as SelectableOption<TItem>[];

    if(this.lazyLoadItemsNumber()){
      baseItems = this.getLazyItemsFromArray(this.selectableItems);
    }
    else{
      baseItems = this.selectableItems;
    }
    return baseItems;
  }

  getLazyItemsFromArray(array: SelectableOption<TItem>[]){
    return array.slice(this.lazyIndex(), this.lazyIndex() + this.lazyLoadItemsNumber()!);
  }

  protected itemInit(idx:number){
    if(idx >=  this.lazyLoadItemsNumber()! - 1){
      this.lazyIndex.set(idx);
      this.updateFilteredItems();
      
    }
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
