export function promiseSerial(tasks) {
    return tasks.reduce((promise, currentTask) => promise.then(result => currentTask().then(Array.prototype.concat.bind(result))), Promise.resolve([]));
}
//# sourceMappingURL=utils.js.map