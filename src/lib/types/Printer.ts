import type {PrinterState} from "$lib/types/PrinterState";
import type {Temperature} from "$lib/types/Temperature";

export interface Printer {
    printer: string;
    ip: string;
    temperature: {
        bed: Temperature;
        tool0: Temperature;
    };
    state: PrinterState;
    error?: string;
    printStatus?: {
        progress: number;
        message: string;
        printDuration: number;
        totalDuration: number;
        filamentUsed: number;
        filename: string;
    };
}