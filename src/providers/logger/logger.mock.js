import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from './logger';
let LoggerMock = class LoggerMock extends Logger {
    log() { }
};
LoggerMock = __decorate([
    Injectable()
], LoggerMock);
export { LoggerMock };
//# sourceMappingURL=logger.mock.js.map