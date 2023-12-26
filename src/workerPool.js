// A simple worker pool implementation
const taskSymbol = Symbol( 'task' );
class WorkerPool
{
    #_threadNum = 0;
    #_workers = [];
    #_busyWorkers = [];
    #_idleWorkers = [];
    #_queue = [];
    #_workerPath = '';
    /**
     * @param {number} threadNum
     * @param {string} workerPath
     * @description Creates a new worker pool
     */
    constructor ( threadNum, workerPath = 'worker.js' )
    {
        this.#_threadNum = threadNum;
        this.#_workerPath = workerPath;
        this.#_init();
    }

    /**
     * @description Initializes the worker pool
     * @returns {void}
     */
    #_init ()
    {
        let threads = this.#_threadNum;
        while ( --threads >= 0 ) this.#_createWorker();
    }

    /**
     * @description Attempts to remove and run a task from the queue
     * @returns {void}
     */
    #_dequeue ()
    {
        if ( !this.#_queue.length || !this.#_idleWorkers.length ) return;
        const { task, cb } = this.#_queue.shift();
        this.run( task, cb );
    }

    /**
     * @description Creates a new worker and adds it to the pool
     * @returns {void}
     */
    #_createWorker ()
    {
        const worker = new Worker( this.#_workerPath );
        worker.onmessage = ( event ) =>
        {
            worker[ taskSymbol ]( null, event );
            worker[ taskSymbol ] = null;
            this.#_busyWorkers.splice( this.#_busyWorkers.indexOf( worker ), 1 );
            this.#_idleWorkers.push( worker );
            this.#_clear();
            this.#_dequeue();
        };
        worker.onerror = ( error ) =>
        {
            worker[ taskSymbol ]( error, null );
            this.#_workers.splice( this.#_workers.indexOf( worker ), 1 );
            this.#_busyWorkers.splice( this.#_busyWorkers.indexOf( worker ), 1 );
            this.#_createWorker();
            this.#_clear();
            this.#_dequeue();
        };
        this.#_workers.push( worker );
        this.#_idleWorkers.push( worker );
        this.#_dequeue();
    }

    /**
     * @description Adds a task to the queue
     * @param {any} task
     * @param {function} cb
     * @returns {void}
     */
    run ( task, cb )
    {
        if (!this.#_workers.length) this.#_init();
        if ( !this.#_idleWorkers.length )
        {
            this.#_queue.push( { task, cb } );
            return;
        };
        const worker = this.#_idleWorkers.shift();
        worker[ taskSymbol ] = cb;
        this.#_busyWorkers.push( worker );
        worker.postMessage( task );
    }

    /**
     * @description Attempts to restore the worker pool to its initial state
     * @returns {void}
     */
    #_clear ()
    {
        if ( this.#_idleWorkers.length !== this.#_threadNum ) return;
        while ( this.#_workers.length )
        {
            const worker = this.#_workers.shift();
            worker.terminate();
        };
        this.#_busyWorkers = [];
        this.#_idleWorkers = [];
    }
}

const workerPool = new WorkerPool( 3 );

export default workerPool;