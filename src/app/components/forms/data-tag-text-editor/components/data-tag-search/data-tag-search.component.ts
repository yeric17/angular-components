import { Component, ElementRef, input, linkedSignal, OnChanges, OnInit, output, signal, viewChild } from '@angular/core';
import { commands } from '../../data/text-editor-commands.data';
import { Tag } from '../../models/text-editor-model';

@Component({
  selector: 'app-data-tag-search',
  imports: [],
  templateUrl: './data-tag-search.component.html',
  styleUrl: './data-tag-search.component.scss'
})
export class DataTagSearchComponent implements OnInit {

  //#region DOM Elements
  protected searchInput = viewChild('searchInput', { read: ElementRef<HTMLInputElement> });
  //#endregion

  //#region Properties
  protected value = signal<string>('');

  //#endregion

  //#region Inputs
  initialChart = input.required<string>();
  tags = input.required<Tag[]>();
  filteredTags = linkedSignal({
    source: this.value,
    computation: () => {
      const value = this.value();
      if (!value) {
        return this.tags();
      }
      const filtered = [...this.tags().filter((tag) => tag.name.toLowerCase().includes(value.toLowerCase()))];
      return filtered;
    }
  });
  //#endregion

  //#region Outputs
  onChangeTagSelected = output<Tag>();
  //#endregion

  protected selectedTag = linkedSignal({
    source: this.filteredTags,
    computation: () => {
      const tag = this.filteredTags()[0] ?? null;
      this.onChangeTagSelected.emit(tag);
      return tag;
    }
  });


  ngOnInit(): void {
    console.log(this.searchInput())
    this.searchInput()?.nativeElement.addEventListener('input', () => {
      console.log('Input event triggered');
    });
  }

  public inputChange(): void {
    let value = this.searchInput()?.nativeElement.textContent;
    value = value.replace(/#|\n/g, '');


    this.value.set(value ?? '');


    console.log(this.value())
  }

  selectTag(tag: Tag): void {
    this.selectedTag.set(tag);
    this.onChangeTagSelected.emit(tag);
  }

  navigate(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const currentIndex = this.filteredTags().indexOf(this.selectedTag());
      const nextIndex = (currentIndex + 1) % this.filteredTags().length;
      this.selectedTag.set(this.filteredTags()[nextIndex]);
      this.onChangeTagSelected.emit(this.selectedTag());
      return;
    } 

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const currentIndex = this.filteredTags().indexOf(this.selectedTag());
      const prevIndex = (currentIndex - 1 + this.filteredTags().length) % this.filteredTags().length;
      this.selectedTag.set(this.filteredTags()[prevIndex]);
      this.onChangeTagSelected.emit(this.selectedTag());
      return;
    }
  }
}
