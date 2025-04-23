import { Component } from "@angular/core";
import { PopoverDirective } from "./directives/popover.directive";
import { OverlayModule } from "@angular/cdk/overlay";


@Component({
  selector: 'app-popover',
  imports: [PopoverDirective, OverlayModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
})
export class PopoverComponent {
  
}
