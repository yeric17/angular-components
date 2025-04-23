import { Directive, ElementRef, HostListener, input, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Directive({
    selector: '[appPopover]'
})
export class PopoverDirective {
    @Input('appPopover') templateRef!: TemplateRef<any>;
    private overlayRef: OverlayRef | null = null;

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ) { }


    @HostListener('mouseenter', ['$event'])
    togglePopover() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        } else {
            // Define la estrategia de posición para que el popover se muestre debajo del elemento
            const positionStrategy = this.overlay.position()
                .flexibleConnectedTo(this.elementRef)
                .withPositions([{
                    originX: 'center',
                    originY: 'bottom',
                    overlayX: 'center',
                    overlayY: 'top'
                }]);


            this.overlayRef = this.overlay.create({ positionStrategy });


            const templateRef = this.templateRef;

            if(!templateRef) return;

            const templatePortal = new TemplatePortal(templateRef, this.viewContainerRef);
            this.overlayRef.attach(templatePortal);
        }
    }

    @HostListener('mouseleave', ['$event'])
    hidePopover() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    @HostListener('document:mouseup', ['$event'])
    closePopover(event: MouseEvent) {
        if (this.overlayRef && !this.overlayRef.overlayElement.contains(event.target as Node)) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
}
