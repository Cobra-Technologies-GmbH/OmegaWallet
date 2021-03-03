import { __awaiter } from "tslib";
import { async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { TxDetailsModal } from './tx-details';
describe('TxDetailsModal', () => {
    let fixture;
    let instance;
    beforeEach(async(() => TestUtils.configurePageTestingModule([TxDetailsModal]).then(testEnv => {
        fixture = testEnv.fixture;
        instance = testEnv.instance;
        fixture.detectChanges();
    })));
    afterEach(() => {
        fixture.destroy();
    });
    describe('Methods', () => {
        describe('#saveMemoInfo', () => {
            it('should set btx note body to the new txMemo', () => __awaiter(void 0, void 0, void 0, function* () {
                instance.btx = { note: {} };
                instance.txMemo = 'new memo';
                yield instance.saveMemoInfo();
                expect(instance.btx.note.body).toEqual('new memo');
            }));
        });
    });
});
//# sourceMappingURL=tx-details.spec.js.map