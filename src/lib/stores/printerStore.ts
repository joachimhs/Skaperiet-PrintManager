import {type Writable, writable} from 'svelte/store';
import {get} from 'svelte/store';
import type {Printer} from "$lib/types/Printer";
import UploadedFile from "$lib/components/UploadedFile.svelte";
import type {PrinterProfile} from "$lib/types/PrinterProfile";

export const printers: Writable<Printer[]> = writable<Printer[]>([]);
export const uploadedFiles: Writable<UploadedFile[]> = writable<UploadedFile[]>([]);
export const printerProfiles: Writable<PrinterProfile[]> = writable<PrinterProfile[]>([]);
let printerProfilesGenerated = false;

function generatePrinterProfiles() {

    printerProfiles.set([
        {
            filename: "profile1.ini",
            description: "15% infill, normal hastighet",
            longDescription: "Profil 1: For enkle figurer som ikke trenger verken 'brim' eller 'support'."
        },
        {
            filename: "profile2.ini",
            description: "15% infill, med Brim, normal hastighet",
            longDescription: "Profil 2: For figurer som trenger 'brim' for å feste figuren bedre til plata."
        },
        {
            filename: "profile3.ini",
            description: "15% infill, med supports, normal hastighet",
            longDescription: "Profil 3: For figurer som trenger 'support' for å støtte opp figuren under utskrift."
        },
        {
            filename: "profile4.ini",
            description: "15% infill, med supports og brim, normal hastighet",
            longDescription: "Profil 4: For figurer som trenger både 'brim' og 'support'"
        },
        {
            filename: "profile5.ini",
            description: "5% infill, rask",
            longDescription: "Profil 5: For Store figurer som ikke trenger så mye infill. Raskere utskrift.'"
        },
        {
            filename: "profile6.ini",
            description: "3% infill, rask",
            longDescription: "Profil 5: For Store figurer som ikke trenger så mye infill. Raskere utskrift.'"
        }
    ]);
}

export async function fetchPrinters() {
    const rawResponse = await fetch('/api/printers');
    const printerData = await rawResponse.json();
    printers.set(printerData);
}

export async function updatePrinters() {
    const rawResponse = await fetch('/api/printers');
    const printerData = await rawResponse.json();

    printers.update(currentPrinters => {
        for (const printer of printerData) {
            const currentPrinter = currentPrinters.find((p) => p.printer.printer === printer.printer.printer);
            console.log('CURRENT PRINTER:', currentPrinter);
            if (currentPrinter) {
                currentPrinter.temperature = printer.temperature;
                currentPrinter.state = printer.state;
                currentPrinter.printStatus = printer.printStatus;
            }

            console.log('updates printer', currentPrinters);
        }
        return currentPrinters;
    });
}

export function getFetchedPrinter(printername: string) {
    const printerData = get(printers);
    return printerData.find((printer) => printer.printer === printername);
}

export async function fetchUploadedFiles() {
    const rawResponse = await fetch('/api/uploadedFiles');
    const fileData = await rawResponse.json();
    uploadedFiles.set(fileData.uploadedFiles);
}

export function fetchPrinterProfiles() {
    if (!printerProfilesGenerated) {
        generatePrinterProfiles();
        printerProfilesGenerated = true;
    }
}

export async function startUploadedStlPrint(filename: string, printer: Printer, profile: string) {
    const data = {
        filename: filename,
        profile: profile,
        printer: printer
    }

    fetch('/api/stl/print', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
