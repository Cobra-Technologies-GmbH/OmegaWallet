import { __awaiter, __decorate, __metadata } from "tslib";
import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Events, NavController, NavParams } from 'ionic-angular';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ActionSheetProvider } from '../../../../providers/action-sheet/action-sheet';
import { ConfettiProvider } from '../../../../providers/confetti/confetti';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { GiftCardProvider } from '../../../../providers/gift-card/gift-card';
import { ClaimCodeType } from '../../../../providers/gift-card/gift-card.types';
import { PlatformProvider } from '../../../../providers/platform/platform';
import { PrintableCardComponent } from './printable-card/printable-card';
let CardDetailsPage = class CardDetailsPage {
    constructor(actionSheetProvider, confettiProvider, externalLinkProvider, giftCardProvider, nav, navParams, events, socialSharing, platformProvider) {
        this.actionSheetProvider = actionSheetProvider;
        this.confettiProvider = confettiProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.giftCardProvider = giftCardProvider;
        this.nav = nav;
        this.navParams = navParams;
        this.events = events;
        this.socialSharing = socialSharing;
        this.platformProvider = platformProvider;
        this.ClaimCodeType = ClaimCodeType;
        this.updateGiftCardsSubject = new Subject();
        this.bwsEventHandler = (_, type) => {
            if (type == 'NewBlock') {
                this.updateGiftCard();
            }
        };
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.card = this.navParams.get('card');
            this.barcodeData = this.card.barcodeData || this.card.claimCode;
            this.barcodeFormat = getBarcodeFormat(this.card.barcodeFormat);
            this.cardConfig = yield this.giftCardProvider.getCardConfig(this.card.name);
            this.updateGiftCard();
        });
    }
    ionViewWillEnter() {
        this.events.subscribe('bwsEvent', this.bwsEventHandler);
        this.navParams.get('showConfetti') && this.showConfetti();
        this.updateGiftCardsSubject
            .pipe(debounceTime(1000), switchMap(() => this.giftCardProvider.updatePendingGiftCards([this.card])))
            .subscribe(card => (this.card = card));
    }
    showConfetti() {
        this.confettiProvider.confetti(this.confetti.nativeElement);
    }
    ionViewWillLeave() {
        this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
        this.updateGiftCardsSubject.unsubscribe();
    }
    updateGiftCard() {
        this.updateGiftCardsSubject.next();
    }
    doRefresh(refresher) {
        this.updateGiftCard();
        setTimeout(() => {
            refresher.complete();
        }, 2000);
    }
    copyCode(code) {
        this.actionSheetProvider
            .createInfoSheet('copied-gift-card-claim-code', {
            cardConfig: this.cardConfig,
            claimCode: code
        })
            .present();
    }
    showClaimLinkUI() {
        return (this.cardConfig &&
            this.card &&
            (this.cardConfig.defaultClaimCodeType === 'link' ||
                !this.card.claimCode) &&
            this.card.status === 'SUCCESS');
    }
    showBarcode() {
        return (this.cardConfig &&
            this.cardConfig.defaultClaimCodeType === ClaimCodeType.barcode);
    }
    archive() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.giftCardProvider.archiveCard(this.card);
            this.nav.pop();
        });
    }
    unarchive() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.giftCardProvider.unarchiveCard(this.card);
        });
    }
    logRedeemCardEvent(isManuallyClaimed) {
        if (!isManuallyClaimed) {
            this.giftCardProvider.logEvent('giftcards_redeem', {
                brand: this.cardConfig.name,
                usdAmount: this.card.amount
            });
        }
        else {
            this.giftCardProvider.logEvent('giftcards_mark_used', {
                brand: this.cardConfig.name,
                usdAmount: this.card.amount
            });
        }
    }
    hasPin() {
        const legacyCards = [
            'Amazon.com',
            'Amazon.co.jp',
            'Mercado Livre'
        ];
        const shouldHidePin = this.cardConfig && this.cardConfig.hidePin;
        const pin = this.card && this.card.pin;
        return !shouldHidePin && pin && legacyCards.indexOf(this.card.name) === -1
            ? true
            : false;
    }
    openArchiveSheet() {
        this.showInfoSheet('archive-gift-card', () => this.archive());
    }
    showInfoSheet(sheetName, onDidDismiss = () => { }) {
        const sheet = this.actionSheetProvider.createInfoSheet(sheetName);
        sheet.present();
        sheet.onDidDismiss(confirm => {
            if (confirm) {
                const isManuallyClaimed = true;
                this.logRedeemCardEvent(isManuallyClaimed);
                onDidDismiss(confirm);
            }
        });
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
    redeem() {
        const redeemUrl = `${this.cardConfig.redeemUrl}${this.card.claimCode}`;
        this.cardConfig.redeemUrl
            ? this.redeemWithUrl(redeemUrl)
            : this.claimManually();
    }
    claimManually() {
        this.cardConfig.printRequired
            ? this.print()
            : this.copyCode(this.card.claimCode);
    }
    redeemWithUrl(redeemUrl) {
        const isManuallyClaimed = false;
        this.logRedeemCardEvent(isManuallyClaimed);
        this.externalLinkProvider.open(redeemUrl);
    }
    print() {
        this.platformProvider.isCordova ? this.printCordova() : window.print();
    }
    printCordova() {
        const image = this.printableCard.getPrintableImage();
        this.platformProvider.isAndroid
            ? this.openExternalLink(this.card.claimLink)
            : this.socialSharing.share(null, 'gift-card', image);
    }
    viewRedemptionCode() {
        this.externalLinkProvider.open(this.card.claimLink);
    }
    showInvoice() {
        this.externalLinkProvider.open(this.card.invoiceUrl);
    }
    shareCode() {
        this.socialSharing.share(this.card.claimLink || this.card.claimCode);
    }
    showMoreOptions() {
        const showShare = this.platformProvider.isCordova &&
            (this.card.claimLink || this.card.claimCode);
        const hidePrint = !this.card.claimLink && this.platformProvider.isAndroid;
        const sheet = this.actionSheetProvider.createOptionsSheet('gift-card-options', {
            card: this.card,
            hidePrint,
            showShare
        });
        sheet.present();
        sheet.onDidDismiss(data => {
            switch (data) {
                case 'archive':
                    return this.openArchiveSheet();
                case 'unarchive':
                    return this.unarchive();
                case 'view-invoice':
                    return this.showInvoice();
                case 'share-code':
                    return this.shareCode();
                case 'print-card':
                    return setTimeout(() => this.print(), 200);
            }
        });
    }
    close() {
        this.nav.pop();
    }
};
__decorate([
    ViewChild(PrintableCardComponent),
    __metadata("design:type", PrintableCardComponent)
], CardDetailsPage.prototype, "printableCard", void 0);
__decorate([
    ViewChild('confetti'),
    __metadata("design:type", ElementRef)
], CardDetailsPage.prototype, "confetti", void 0);
CardDetailsPage = __decorate([
    Component({
        selector: 'card-details-page',
        templateUrl: 'card-details.html',
        animations: [
            trigger('enterAnimation', [
                transition(':enter', [
                    style({ opacity: 0 }),
                    animate('400ms 250ms ease', style({ opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ opacity: 1 }),
                    animate('400ms 250ms ease', style({ opacity: 0 }))
                ])
            ]),
            trigger('preventInitialChildAnimations', [
                transition(':enter', [query(':enter', [], { optional: true })])
            ])
        ]
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        ConfettiProvider,
        ExternalLinkProvider,
        GiftCardProvider,
        NavController,
        NavParams,
        Events,
        SocialSharing,
        PlatformProvider])
], CardDetailsPage);
export { CardDetailsPage };
function getBarcodeFormat(barcodeFormat = '') {
    const lowercaseFormats = ['pharmacode', 'codabar'];
    const supportedFormats = [
        'CODE128',
        'CODE128A',
        'CODE128B',
        'CODE128C',
        'EAN',
        'UPC',
        'EAN8',
        'EAN5',
        'EAN2',
        'CODE39',
        'ITF14',
        'MSI',
        'MSI10',
        'MSI11',
        'MSI1010',
        'MSI1110',
        'QR',
        ...lowercaseFormats
    ];
    const normalizedFormat = lowercaseFormats.includes(barcodeFormat.toLowerCase())
        ? barcodeFormat.toLowerCase()
        : barcodeFormat.replace(/\s/g, '').toUpperCase();
    return supportedFormats.includes(normalizedFormat)
        ? normalizedFormat
        : 'CODE128';
}
//# sourceMappingURL=card-details.js.map