import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Slides } from 'ionic-angular';
import * as _ from 'lodash';
import { CurrencyProvider } from '../../providers/currency/currency';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeeProvider } from '../../providers/fee/fee';
import { Logger } from '../../providers/logger/logger';
import { PopupProvider } from '../../providers/popup/popup';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let ChooseFeeLevelComponent = class ChooseFeeLevelComponent extends ActionSheetParent {
    constructor(currencyProvider, logger, popupProvider, feeProvider, translate, externalLinkProvider) {
        super();
        this.currencyProvider = currencyProvider;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.feeProvider = feeProvider;
        this.translate = translate;
        this.externalLinkProvider = externalLinkProvider;
        this.FEE_MULTIPLIER = 10;
        this.FEE_MIN = 0;
        this.feeOpts = [];
    }
    ngOnInit() {
        this.okText = this.translate.instant('Ok');
        this.cancelText = this.translate.instant('Cancel');
        // From parent controller
        this.network = this.params.network;
        this.coin = this.params.coin;
        this.feeLevel = this.params.feeLevel;
        this.setFeeUnits();
        // IF usingCustomFee
        this.customFeePerKB = this.params.customFeePerKB
            ? this.params.customFeePerKB
            : null;
        this.feePerSatByte = this.params.feePerSatByte
            ? this.params.feePerSatByte
            : null;
        if (_.isEmpty(this.feeLevel))
            this.showErrorAndClose(null, this.translate.instant('Fee level is not defined'));
        this.loadingFee = true;
        this.feeProvider
            .getFeeLevels(this.coin)
            .then(levels => {
            this.loadingFee = false;
            if (_.isEmpty(levels)) {
                this.showErrorAndClose(null, this.translate.instant('Could not get fee levels'));
                return;
            }
            this.feeLevels = levels;
            this.setFeeRates();
            if (this.customFeePerKB)
                this._setCustomFee();
        })
            .catch(err => {
            this.loadingFee = false;
            this.showErrorAndClose(null, err);
            return;
        });
    }
    setFeeUnits() {
        const { feeUnit, feeUnitAmount, blockTime } = this.currencyProvider.getFeeUnits(this.coin);
        this.feeUnit = feeUnit;
        this.feeUnitAmount = feeUnitAmount;
        this.blockTime = blockTime;
    }
    setFeeRates() {
        this.feeLevels.levels[this.network].forEach((feeLevel, i) => {
            this.feeOpts[i] = feeLevel;
            this.feeOpts[i].feePerSatByte = (feeLevel.feePerKb / this.feeUnitAmount).toFixed();
            let avgConfirmationTime = feeLevel.nbBlocks * this.blockTime;
            this.feeOpts[i].avgConfirmationTime = avgConfirmationTime;
            if (feeLevel.level == this.feeLevel)
                this.feePerSatByte = (this.feeOpts[i].feePerKb / this.feeUnitAmount).toFixed();
        });
        setTimeout(() => {
            const index = this.feeOpts
                .map(feeOpt => feeOpt.level)
                .indexOf(this.feeLevel);
            index == -1
                ? this.feeSlides.slideTo(this.feeSlides.length(), 200)
                : this.feeSlides.slideTo(index, 200);
        }, 300);
        // Warnings
        this.setFeesRecommended();
        this.checkFees(this.feePerSatByte);
    }
    _setCustomFee() {
        this.avgConfirmationTime = null;
        this.customSatPerByte = Number(this.customFeePerKB) / this.feeUnitAmount;
    }
    setCustomFee() {
        this.changeSelectedFee('custom');
    }
    showErrorAndClose(title, msg) {
        title = title ? title : this.translate.instant('Error');
        this.logger.error(msg);
        this.popupProvider.ionicAlert(title, msg).then(() => {
            this.dismiss();
        });
    }
    setFeesRecommended() {
        this.maxFeeRecommended = this.getMaxRecommended();
        this.minFeeRecommended = this.getMinRecommended();
        this.minFeeAllowed = this.FEE_MIN;
        this.maxFeeAllowed = this.maxFeeRecommended * this.FEE_MULTIPLIER;
        this.maxFee =
            this.maxFeeRecommended > this.maxFeeAllowed
                ? this.maxFeeRecommended
                : this.maxFeeAllowed;
        this.minFee =
            this.minFeeRecommended < this.minFeeAllowed
                ? this.minFeeRecommended
                : this.minFeeAllowed;
    }
    getMinRecommended() {
        let value = _.find(this.feeLevels.levels[this.network], feeLevel => {
            return feeLevel.level == 'superEconomy';
        });
        return parseInt((value.feePerKb / this.feeUnitAmount).toFixed(), 10);
    }
    getMaxRecommended() {
        let value = _.find(this.feeLevels.levels[this.network], feeLevel => {
            return feeLevel.level == 'urgent';
        });
        return parseInt((value.feePerKb / this.feeUnitAmount).toFixed(), 10);
    }
    checkFees(feePerSatByte) {
        let fee = Number(feePerSatByte);
        this.showError = fee <= this.minFeeAllowed ? true : false;
        this.showMinWarning =
            fee > this.minFeeAllowed && fee < this.minFeeRecommended ? true : false;
        this.showMaxWarning =
            fee < this.maxFeeAllowed && fee > this.maxFeeRecommended ? true : false;
    }
    changeSelectedFee(feeLevel) {
        this.logger.debug('New fee level: ' + feeLevel);
        this.feeLevel = feeLevel;
        this.customFeePerKB = this.customSatPerByte
            ? (this.customSatPerByte * this.feeUnitAmount).toFixed()
            : null;
        this.dismiss({
            newFeeLevel: this.feeLevel,
            customFeePerKB: this.customFeePerKB,
            showMinWarning: this.showMinWarning
        });
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
};
__decorate([
    ViewChild('feeSlides'),
    __metadata("design:type", Slides)
], ChooseFeeLevelComponent.prototype, "feeSlides", void 0);
ChooseFeeLevelComponent = __decorate([
    Component({
        selector: 'page-choose-fee-level',
        templateUrl: 'choose-fee-level.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        Logger,
        PopupProvider,
        FeeProvider,
        TranslateService,
        ExternalLinkProvider])
], ChooseFeeLevelComponent);
export { ChooseFeeLevelComponent };
//# sourceMappingURL=choose-fee-level.js.map