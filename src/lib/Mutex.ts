export class Mutex {
    constructor() {
        // Constructor logic here
    }

    private lockPromise: Promise<void> | null = null;

    async acquire(): Promise<void> {
        let release: () => void;

        const waitForLock = new Promise<void>(resolve => (release = resolve));
        const lockAcquired = this.lockPromise?.then(() => release());

        this.lockPromise = lockAcquired ? lockAcquired.then(() => waitForLock) : waitForLock;

        return this.lockPromise;
    }

    async release(): Promise<void> {
        this.lockPromise = null;
    }
}
