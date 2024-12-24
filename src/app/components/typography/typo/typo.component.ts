import { Component, input } from '@angular/core';
import { baseConfig, TypoStyle } from './config/typo.config';
import { NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'app-typo',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './typo.component.html',
  styleUrl: './typo.component.scss'
})
export class TypoComponent {
  styleRef = input<TypoStyle>('body')
  config = baseConfig

  get tag(): string {
    return this.config[this.styleRef()].tag
  }
}
