export interface PrinterState {
    text: string;
    flags: {
        operational: boolean;
        paused: boolean;
        printing: boolean;
        cancelling: boolean;
        pausing: boolean;
        error: boolean;
        ready: boolean;
        closedOrError: boolean;
    };
}