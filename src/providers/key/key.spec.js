import { __awaiter } from "tslib";
import { TestUtils } from '../../test';
// Providers
import { KeyProvider, Logger, PersistenceProvider } from '..';
describe('KeyProvider', () => {
    let keyProvider;
    let persistenceProvider;
    let logger;
    let key;
    let key1;
    let key2;
    let key3;
    let key4;
    let key5;
    let keys;
    let warnSpy;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testBed = TestUtils.configureProviderTestingModule();
        keyProvider = testBed.get(KeyProvider);
        persistenceProvider = testBed.get(PersistenceProvider);
        persistenceProvider.load();
        logger = testBed.get(Logger);
        warnSpy = spyOn(logger, 'warn');
        yield persistenceProvider.setKeys([]);
    }));
    describe('addKey', () => {
        it('should add provided key to storage for the first time', () => __awaiter(void 0, void 0, void 0, function* () {
            key = {};
            key.toObj = () => ({
                id: 'id1',
                xPrivKey: 'xPrivKey1',
                version: 1
            });
            yield keyProvider.load();
            keyProvider
                .addKey(key)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        }
                    ]);
                });
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it("should add provided key to storage if doesn't already added", () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            key = {};
            key.toObj = () => ({
                id: 'id3',
                xPrivKey: 'xPrivKey3',
                version: 1
            });
            keyProvider
                .addKey(key)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        },
                        {
                            id: 'id3',
                            xPrivKey: 'xPrivKey3',
                            version: 1
                        }
                    ]);
                });
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it('should replace with the provided key if it was already added', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            key = {};
            key.toObj = () => ({
                id: 'id1',
                xPrivKeyEncrypted: 'xPrivKeyEncrypted',
                version: 1
            });
            keyProvider
                .addKey(key)
                .then(() => {
                persistenceProvider.getKeys().then(() => {
                    expect().nothing();
                });
            })
                .catch(err => {
                expect(err).toBeDefined();
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        }
                    ]);
                });
            });
        }));
    });
    describe('addKeys', () => {
        it('should add provided keys to storage for the first time', () => __awaiter(void 0, void 0, void 0, function* () {
            key1 = {};
            key1.toObj = () => ({
                id: 'id1',
                xPrivKey: 'xPrivKey1',
                version: 1
            });
            key2 = {};
            key2.toObj = () => ({
                id: 'id2',
                xPrivKey: 'xPrivKey2',
                version: 1
            });
            keys = [key1, key2];
            yield keyProvider.load();
            keyProvider
                .addKeys(keys)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        }
                    ]);
                });
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it('should add provided keys to storage', () => __awaiter(void 0, void 0, void 0, function* () {
            key1 = {
                id: 'id1',
                xPrivKey: 'xPrivKey1',
                version: 1
            };
            key2 = {
                id: 'id2',
                xPrivKey: 'xPrivKey2',
                version: 1
            };
            key3 = {};
            key3.toObj = () => ({
                id: 'id3',
                xPrivKey: 'xPrivKey3',
                version: 1
            });
            key4 = {};
            key4.toObj = () => ({
                id: 'id4',
                xPrivKey: 'xPrivKey4',
                version: 1
            });
            yield persistenceProvider.setKeys([key1, key2]);
            keys = [key3, key4];
            yield keyProvider.load();
            keyProvider
                .addKeys(keys)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        },
                        {
                            id: 'id3',
                            xPrivKey: 'xPrivKey3',
                            version: 1
                        },
                        {
                            id: 'id4',
                            xPrivKey: 'xPrivKey4',
                            version: 1
                        }
                    ]);
                });
                expect(warnSpy).not.toHaveBeenCalled();
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it('should add just unrepeated provided keys', () => __awaiter(void 0, void 0, void 0, function* () {
            key1 = {
                id: 'id1',
                xPrivKey: 'xPrivKey1',
                version: 1
            };
            key2 = {
                id: 'id2',
                xPrivKey: 'xPrivKey2',
                version: 1
            };
            key3 = {};
            key3.toObj = () => ({
                id: 'id3',
                xPrivKey: 'xPrivKey3',
                version: 1
            });
            key4 = {};
            key4.toObj = () => ({
                id: 'id4',
                xPrivKey: 'xPrivKey4',
                version: 1
            });
            key5 = {};
            key5.toObj = () => ({
                id: 'id5',
                xPrivKey: 'xPrivKey5',
                version: 1
            });
            key = {};
            key.toObj = () => ({
                id: 'id1',
                xPrivKey: 'xPrivKey1',
                version: 1
            });
            yield persistenceProvider.setKeys([key1, key2]);
            keys = [key3, key4, key3, key, key5];
            yield keyProvider.load();
            keyProvider
                .addKeys(keys)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        },
                        {
                            id: 'id3',
                            xPrivKey: 'xPrivKey3',
                            version: 1
                        },
                        {
                            id: 'id4',
                            xPrivKey: 'xPrivKey4',
                            version: 1
                        },
                        {
                            id: 'id5',
                            xPrivKey: 'xPrivKey5',
                            version: 1
                        }
                    ]);
                });
                expect(warnSpy).toHaveBeenCalledTimes(2);
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it('should not add new keys if are already added', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            key3 = {};
            key3.toObj = () => ({
                id: 'id1',
                xPrivKey: 'xPrivKey3',
                version: 1
            });
            key4 = {};
            key4.toObj = () => ({
                id: 'id2',
                xPrivKey: 'xPrivKey4',
                version: 1
            });
            keys = [key3, key4];
            yield keyProvider.load();
            keyProvider
                .addKeys(keys)
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        }
                    ]);
                });
                expect(warnSpy).toHaveBeenCalledTimes(2);
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
    });
    describe('getKey', () => {
        it("should get null if provided keyId doesn't match", () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            expect(keyProvider.getKey('id3')).toBeNull();
        }));
        it('should get the correct key of a provided keyId', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            expect(keyProvider.getKey('id2')).toBeDefined();
        }));
    });
    describe('removeKey', () => {
        it('should return error if trying to remove a key from undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            yield keyProvider.load();
            keyProvider
                .removeKey('id1')
                .then(() => {
                expect().nothing();
            })
                .catch(err => {
                expect(err).toBeDefined();
            });
        }));
        it('should remove key of a provided id if it was already added', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                },
                {
                    id: 'id3',
                    xPrivKey: 'xPrivKey3',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            keyProvider
                .removeKey('id2')
                .then(() => {
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id3',
                            xPrivKey: 'xPrivKey3',
                            version: 1
                        }
                    ]);
                });
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it("should return error if trying to remove a key and it doesn't already added", () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                },
                {
                    id: 'id2',
                    xPrivKey: 'xPrivKey2',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            keyProvider
                .removeKey('id3')
                .then(() => {
                expect().nothing();
            })
                .catch(err => {
                expect(err).toBeDefined();
                persistenceProvider.getKeys().then((keys) => {
                    expect(keys).toEqual([
                        {
                            id: 'id1',
                            xPrivKey: 'xPrivKey1',
                            version: 1
                        },
                        {
                            id: 'id2',
                            xPrivKey: 'xPrivKey2',
                            version: 1
                        }
                    ]);
                });
            });
        }));
    });
    describe('Function: encrypt', () => {
        it('Should call askPassword to encrypt key', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            let spyAskPassword = spyOn(keyProvider, 'askPassword');
            spyAskPassword.and.returnValue(Promise.resolve('password1'));
            keyProvider.encrypt('id1').catch(err => {
                expect(err).toBeUndefined();
            });
            expect(spyAskPassword).toHaveBeenCalled();
        }));
        it('Should reject the promise if password is an empty string', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey1',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve(''));
            keyProvider.encrypt('id1').catch(err => {
                expect(err).toBeDefined(); // 'No password'
            });
        }));
    });
    describe('Function: decrypt', () => {
        it('Should call askPassword to decrypt key', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: '{"iv":"E/QaP6isnNYkBk51tiLlfw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"iQTE8Be+cN8=","ct":"1AvFHKxOQjzIIJ5/JxfDe/BtbITnskr/Uw=="}',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            const spyAskPassword = spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve('1'));
            keyProvider.decrypt('id1');
            expect(spyAskPassword).toHaveBeenCalled();
        }));
        it('Should reject the promise if password is an empty string', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: 'xPrivKeyEncrypted',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve(''));
            keyProvider.decrypt('id1').catch(err => {
                expect(err).toBeDefined(); // 'No password'
            });
        }));
        it('Should reject the promise if password is not correct', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: 'xPrivKeyEncrypted',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve('wrong_password'));
            keyProvider.decrypt('id1').catch(err => {
                expect(err).toBeDefined(); // wrong password'
            });
        }));
    });
    describe('Function: handleEncryptedWallet', () => {
        it('Should call askPassword and resolve with the correct password', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: '{"iv":"E/QaP6isnNYkBk51tiLlfw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"iQTE8Be+cN8=","ct":"1AvFHKxOQjzIIJ5/JxfDe/BtbITnskr/Uw=="}',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            const spyAskPassword = spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve('1'));
            keyProvider
                .handleEncryptedWallet('id1')
                .then(pass => {
                expect(pass).toEqual('1');
            })
                .catch(err => {
                expect(err).toBeUndefined();
            });
            expect(spyAskPassword).toHaveBeenCalled();
        }));
        it('Should resolve if priv key is not encrypted', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKey: 'xPrivKey',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            keyProvider.handleEncryptedWallet('id1').catch(err => {
                expect(err).toBeUndefined();
            });
        }));
        it('Should reject the promise if password is wrong', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: '{"iv":"E/QaP6isnNYkBk51tiLlfw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"iQTE8Be+cN8=","ct":"1AvFHKxOQjzIIJ5/JxfDe/BtbITnskr/Uw=="}',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            const spyAskPassword = spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve('2'));
            keyProvider.handleEncryptedWallet('id1').catch(err => {
                expect(err).toEqual(new Error('WRONG_PASSWORD'));
            });
            expect(spyAskPassword).toHaveBeenCalled();
        }));
        it('Should reject the promise if password is an empty string', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: 'xPrivKeyEncrypted',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve(''));
            keyProvider.handleEncryptedWallet('id1').catch(err => {
                expect(err).toEqual(new Error('NO_PASSWORD'));
            });
        }));
        it('Should reject the promise if password prompt is cancelled', () => __awaiter(void 0, void 0, void 0, function* () {
            yield persistenceProvider.setKeys([
                {
                    id: 'id1',
                    xPrivKeyEncrypted: 'xPrivKeyEncrypted',
                    version: 1
                }
            ]);
            yield keyProvider.load();
            spyOn(keyProvider, 'askPassword').and.returnValue(Promise.resolve(null));
            keyProvider.handleEncryptedWallet('id1').catch(err => {
                expect(err).toEqual(new Error('PASSWORD_CANCELLED'));
            });
        }));
    });
});
//# sourceMappingURL=key.spec.js.map