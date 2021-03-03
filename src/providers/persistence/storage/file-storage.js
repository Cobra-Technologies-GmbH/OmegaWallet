import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';
import { KeyAlreadyExistsError } from './istorage';
let FileStorage = class FileStorage {
    constructor(file, log) {
        this.file = file;
        this.log = log;
    }
    init() {
        return new Promise((resolve, reject) => {
            if (this.fs && this.dir)
                return resolve();
            const onSuccess = (fs) => {
                this.log.debug('File system started: ', fs.name, fs.root.name);
                this.fs = fs;
                return this.getDir().then(dir => {
                    if (!dir.nativeURL)
                        return reject();
                    this.dir = dir;
                    this.log.debug('Got main dir:', dir.nativeURL);
                    return resolve();
                });
            };
            const onFailure = (err) => {
                this.log.error('Could not init file system: ' + err.message);
                return Promise.reject(err);
            };
            window.requestFileSystem(1, 0, onSuccess, onFailure);
        });
    }
    // See https://github.com/apache/cordova-plugin-file/#where-to-store-files
    getDir() {
        if (!this.file) {
            return Promise.reject(new Error('Could not write on device storage'));
        }
        const url = this.file.dataDirectory;
        return this.file.resolveDirectoryUrl(url).catch(err => {
            const msg = 'Could not resolve filesystem ' + url;
            this.log.warn(msg, err);
            throw err || new Error(msg);
        });
    }
    parseResult(v) {
        if (!v)
            return null;
        if (!_.isString(v))
            return v;
        let parsed;
        try {
            parsed = JSON.parse(v);
        }
        catch (e) {
            // TODO parse is not necessary
        }
        return parsed || v;
    }
    readFileEntry(fileEntry) {
        return new Promise((resolve, reject) => {
            fileEntry.file(file => {
                const reader = new FileReader();
                reader.onerror = () => {
                    reader.abort();
                    return reject();
                };
                reader.onloadend = () => {
                    return resolve(this.parseResult(reader.result));
                };
                reader.readAsText(file);
            });
        });
    }
    get(k) {
        return new Promise(resolve => {
            this.init()
                .then(() => {
                this.file
                    .getFile(this.dir, k, { create: false })
                    .then(fileEntry => {
                    if (!fileEntry)
                        return resolve();
                    this.readFileEntry(fileEntry)
                        .then(result => {
                        return resolve(result);
                    })
                        .catch(() => {
                        this.log.error('Problem parsing input file.');
                    });
                })
                    .catch(err => {
                    // Not found
                    if (err.code == 1)
                        return resolve();
                    else
                        throw err;
                });
            })
                .catch(err => {
                this.log.error(err);
            });
        });
    }
    set(k, v) {
        return Promise.resolve(this.init().then(() => {
            this.file.getFile(this.dir, k, { create: true }).then(fileEntry => {
                // Create a FileWriter object for our FileEntry (log.txt).
                return new Promise((resolve, reject) => {
                    fileEntry.createWriter(fileWriter => {
                        fileWriter.onwriteend = () => {
                            this.log.debug('Successful file write...');
                            return resolve();
                        };
                        fileWriter.onerror = e => {
                            this.log.error('Failed file write: ' + e.toString());
                            return reject(e.toString());
                        };
                        if (_.isObject(v))
                            v = JSON.stringify(v);
                        if (!_.isString(v))
                            v = v.toString();
                        fileWriter.write(v);
                    });
                });
            });
        }));
    }
    remove(k) {
        return new Promise((resolve, reject) => {
            this.file
                .removeFile(this.dir.nativeURL, k)
                .then(() => {
                this.log.debug(`Storage Key: ${k} removed`);
                resolve();
            })
                .catch(e => {
                reject(e);
            });
        });
    }
    create(k, v) {
        return this.get(k).then(data => {
            if (data)
                throw new KeyAlreadyExistsError();
            this.set(k, v);
        });
    }
};
FileStorage = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [File, Logger])
], FileStorage);
export { FileStorage };
//# sourceMappingURL=file-storage.js.map