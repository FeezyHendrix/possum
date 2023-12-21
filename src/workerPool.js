// A simple worker pool implementation
class WorkerPool
{ 
    /**
     * @param {number} threadNum
     * @param {string} workerPath
     * @description Creates a new worker pool
     */
    constructor ( threadNum, workerPath = 'worker.js' )
    {
        this._threadNum = threadNum;
        this._workerPath = workerPath;
        this._queue = [];
        this._workers = [];
        this._busyWorkers = [];
        this._idleWorkers = [];
        this._init();
    }

    /**
     * @description Initializes the worker pool
     * @returns {void}
     */
    _init ()
    {
        let threads = this._threadNum;
        while ( --threads >= 0 ) this._createWorker();
    }

    /**
     * @description Attempts to remove and run a task from the queue
     * @returns {void}
     */
    _dequeue ()
    {
        if ( !this._queue.length || !this._idleWorkers.length ) return;
        const task = this._queue.shift();
        this._run(task);
    }

    /**
     * @description Creates a new worker and adds it to the pool
     * @returns {void}
     */
    _createWorker ()
    {
        const worker = new Worker(this._workerPath);
        worker.onmessage = ( event ) =>
        {
            this._dequeue();
        };
        worker.onerror = ( error ) =>
        {
            this._createWorker();
            throw error;
        };
        this._workers.push(worker);
        this._idleWorkers.push( worker );
        this._dequeue();
    }

    /**
     * @description Adds a task to the queue
     * @param {any} task
     */
    _run ( task )
    {
        const worker = this._idleWorkers.shift();
        this._busyWorkers.push(worker);
        worker.postMessage(task);
    }

    /**
     * @description Attempts to restore the worker pool to its initial state
     * @returns {void}
     */
    _clear ()
    {
        if ( this._idleWorkers.length !==  this._threadNum) return;
        while ( this._workers.length )
        {
            const worker = this._workers.shift();
            worker.terminate();
        };
        this._busyWorkers = [];
        this._idleWorkers = [];
    }
}

const workerPool = new WorkerPool(3);

export default workerPool;