// A simple worker pool implementation
const taskSymbol = Symbol('task');

class WorkerPool {
    private _threadNum: number = 0;
    private _workers: Worker[] = [];
    private _busyWorkers: Worker[] = [];
    private _idleWorkers: Worker[] = [];
    private _queue: { task: any; cb: Function }[] = [];
    private _workerPath: string = '';

    /**
     * @param {number} threadNum
     * @param {string} workerPath
     * @description Creates a new worker pool
     */
    constructor(threadNum: number, workerPath: string = 'worker.js') {
        this._threadNum = threadNum;
        this._workerPath = workerPath;
        this._init();
    }

    /**
     * @description Initializes the worker pool
     * @returns {void}
     */
    private _init(): void {
        let threads = this._threadNum;
        while (--threads >= 0) this._createWorker();
    }

    /**
     * @description Attempts to remove and run a task from the queue
     * @returns {void}
     */
    private _dequeue(): void {
        if (!this._queue.length || !this._idleWorkers.length) return;
        const { task, cb } = this._queue.shift()!;
        this.run(task, cb);
    }

    /**
     * @description Creates a new worker and adds it to the pool
     * @returns {void}
     */
    private _createWorker(): void {
        const worker: any = new Worker(this._workerPath);
        worker.onmessage = (event: MessageEvent) => {
            worker[taskSymbol](null, event);
            worker[taskSymbol] = null;
            this._busyWorkers.splice(this._busyWorkers.indexOf(worker), 1);
            this._idleWorkers.push(worker);
            this._clear();
            this._dequeue();
        };
        worker.onerror = (error: ErrorEvent) => {
            worker[taskSymbol](error, null);
            this._workers.splice(this._workers.indexOf(worker), 1);
            this._busyWorkers.splice(this._busyWorkers.indexOf(worker), 1);
            this._createWorker();
            this._clear();
            this._dequeue();
        };
        this._workers.push(worker);
        this._idleWorkers.push(worker);
        this._dequeue();
    }

    /**
     * @description Adds a task to the queue
     * @param {any} task
     * @param {function} cb
     * @returns {void}
     */
    public run(task: any, cb: Function): void {
        if (!this._workers.length) this._init();
        if (!this._idleWorkers.length) {
            this._queue.push({ task, cb });
            return;
        }
        const worker: any = this._idleWorkers.shift()!;
        worker[taskSymbol] = cb;
        this._busyWorkers.push(worker);
        worker.postMessage(task);
    }

    /**
     * @description Attempts to restore the worker pool to its initial state
     * @returns {void}
     */
    private _clear(): void {
        if (this._idleWorkers.length !== this._threadNum) return;
        while (this._workers.length) {
            const worker = this._workers.shift();
            worker!.terminate();
        }
        this._busyWorkers = [];
        this._idleWorkers = [];
    }
}

const workerPool = new WorkerPool(3);

export default workerPool;
