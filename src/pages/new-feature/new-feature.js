import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { NavParams, Slides, ViewController } from 'ionic-angular';
import { ThemeProvider } from '../../providers/theme/theme';
let NewFeaturePage = class NewFeaturePage {
    constructor(viewCtrl, navParams, themeProvider) {
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.themeProvider = themeProvider;
        this.endSlide = false;
        this.featureList = [];
        this.featureList.push(...this.navParams.data.featureList.features);
        this.endSlide = this.featureList.length == 1;
        this.isDarkMode = this.themeProvider.isDarkModeEnabled();
    }
    getImage(imagePath) {
        if (this.isDarkMode) {
            var pointIndex = imagePath.lastIndexOf('.');
            var output = [
                imagePath.slice(0, pointIndex),
                '-dark',
                imagePath.slice(pointIndex)
            ].join('');
            return output;
        }
        else {
            return imagePath;
        }
    }
    slideChanged() {
        this.endSlide = this.slider.isEnd();
    }
    nextSlide() {
        this.slider.slideNext();
    }
    close(data) {
        this.viewCtrl.dismiss(data);
    }
};
__decorate([
    ViewChild('newFeatureSlides'),
    __metadata("design:type", Slides)
], NewFeaturePage.prototype, "slider", void 0);
NewFeaturePage = __decorate([
    Component({
        selector: 'page-new-feature',
        templateUrl: 'new-feature.html'
    }),
    __metadata("design:paramtypes", [ViewController,
        NavParams,
        ThemeProvider])
], NewFeaturePage);
export { NewFeaturePage };
//# sourceMappingURL=new-feature.js.map