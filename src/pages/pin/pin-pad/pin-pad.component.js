import { __decorate, __metadata } from "tslib";
import { Component, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
let PinPad = class PinPad {
    constructor() {
        this.integersOnly = false;
        this.keystrokeSubject = new Subject();
        this.keystroke = this.keystrokeSubject.asObservable();
        this.buttonRows = [
            [
                {
                    value: '1',
                    letters: ''
                },
                {
                    value: '2',
                    letters: 'ABC'
                },
                {
                    value: '3',
                    letters: 'DEF'
                }
            ],
            [
                {
                    value: '4',
                    letters: 'GHI'
                },
                {
                    value: '5',
                    letters: 'JKL'
                },
                {
                    value: '6',
                    letters: 'MNO'
                }
            ],
            [
                {
                    value: '7',
                    letters: 'PQRS'
                },
                {
                    value: '8',
                    letters: 'TUV'
                },
                {
                    value: '9',
                    letters: 'WXYZ'
                }
            ],
            [
                {
                    value: '.',
                    letters: ''
                },
                {
                    value: '0',
                    letters: ''
                },
                {
                    value: 'delete',
                    letters: ''
                }
            ]
        ];
    }
    onKeystroke(value) {
        if (this.isValueDisabled(value)) {
            return;
        }
        this.keystrokeSubject.next(value);
    }
    isValueDisabled(value) {
        return value === '.' && this.integersOnly;
    }
};
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], PinPad.prototype, "integersOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], PinPad.prototype, "type", void 0);
__decorate([
    Output(),
    __metadata("design:type", Observable)
], PinPad.prototype, "keystroke", void 0);
PinPad = __decorate([
    Component({
        selector: 'pin-pad',
        template: `
    <ion-row *ngFor="let row of buttonRows">
      <ion-col
        *ngFor="let button of row"
        (click)="onKeystroke(button.value)"
        [ngClass]="{ disabled: isValueDisabled(button.value) }"
        tappable
      >
        <div class="buttons-container" [ngSwitch]="button.value">
          <span *ngSwitchCase="'delete'">
            <img *ngIf="type === 'pin'" src="assets/img/tail-left.svg" />
            <img
              class="amount-delete"
              *ngIf="type === 'amount'"
              src="assets/img/icon-delete.svg"
            />
          </span>
          <span *ngSwitchCase="'.'">
            <span *ngIf="type === 'amount'">.</span>
          </span>
          <span *ngSwitchDefault>{{ button.value }}</span>
        </div>
        <div class="letters" *ngIf="type === 'pin'">{{ button.letters }}</div>
      </ion-col>
    </ion-row>
  `
    })
], PinPad);
export { PinPad };
//# sourceMappingURL=pin-pad.component.js.map