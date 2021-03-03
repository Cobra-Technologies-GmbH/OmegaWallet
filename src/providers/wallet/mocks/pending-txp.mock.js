export class PendingTxpMock {
    constructor() {
        this.version = 3;
        this.createdOn = 1542039346;
        this.id = 'txpId1';
        this.walletId = 'walletId1';
        this.creatorId = 'copayerId1';
        this.coin = 'btc';
        this.network = 'testnet';
        this.outputs = [
            {
                amount: 100000,
                toAddress: 'address1',
                message: null,
                encryptedMessage: null
            }
        ];
        this.amount = 100000;
        this.message = null;
        this.payProUrl = null;
        this.changeAddress = {
            version: '1.0.0',
            createdOn: 1542039346,
            address: 'address1',
            walletId: 'walletId1',
            isChange: true,
            path: 'm/1/455',
            publicKeys: ['publicKeys1', 'publicKeys2'],
            coin: 'btc',
            network: 'testnet',
            type: 'P2SH',
            hasActivity: null,
            _id: '_id1'
        };
        this.inputs = [
            {
                txid: 'txid1',
                vout: 1,
                address: 'address1',
                scriptPubKey: 'scriptPubKey1',
                satoshis: 100000,
                confirmations: 28282,
                locked: false,
                path: 'm/0/174',
                publicKeys: ['publicKeys3', 'publicKeys4']
            },
            {
                txid: 'txid2',
                vout: 0,
                address: 'address2',
                scriptPubKey: 'scriptPubKey2',
                satoshis: 100000,
                confirmations: 3011,
                locked: false,
                path: 'm/0/172',
                publicKeys: ['publicKeys5', 'publicKeys6']
            }
        ];
        this.walletM = 2;
        this.walletN = 2;
        this.requiredSignatures = 2;
        this.requiredRejections = 1;
        this.status = null; // values: pending, accepted
        this.txid = null;
        this.broadcastedOn = null;
        this.inputPaths = ['m/0/174', 'm/0/172'];
        this.actions = [
            {
                version: '1.0.0',
                createdOn: 1542039348,
                copayerId: 'copayerId1',
                type: 'accept',
                signatures: ['signature1', 'signature2'],
                xpub: 'xpub1',
                comment: 'action1',
                copayerName: 'Satoshi Nakamoto'
            }
        ];
        this.outputOrder = [0, 1];
        this.fee = 616;
        this.feeLevel = 'priority';
        this.feePerKb = 1000;
        this.excludeUnconfirmedUtxos = true;
        this.addressType = 'P2SH';
        this.customData = null;
        this.proposalSignature = 'proposalSignature1';
        this.proposalSignaturePubKey = 'proposalSignaturePubKey1';
        this.proposalSignaturePubKeySig = 'proposalSignaturePubKeySig1';
        this.derivationStrategy = 'BIP44';
        this.creatorName = 'Satoshi Nakamoto';
        this.deleteLockTime = 0;
        this.encryptedMessage = null;
        this.hasUnconfirmedInputs = false;
    }
}
//# sourceMappingURL=pending-txp.mock.js.map