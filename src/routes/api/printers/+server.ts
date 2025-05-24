import type { RequestHandler } from '@sveltejs/kit';
import type { Printer, PrinterState, Temperature } from '$lib/stores/printerStore';
import { printers } from '$lib/stores/printerStore';
import { env } from '$env/dynamic/private'; // Use dynamic to access variables that are available only at runtime.

interface PhysicalPrinter {
    printer: string;
    ip: string;
}

const physicalPrinters: PhysicalPrinter[] = [
    { printer: 'neptune1', ip: env.PRINTER_1 },
    { printer: 'neptune2', ip: env.PRINTER_2 },
    { printer: 'neptune3', ip: env.PRINTER_3 },
    { printer: 'neptune4', ip: env.PRINTER_4 },
    { printer: 'neptune5', ip: env.PRINTER_5 }
];

/*export const GET: RequestHandler = async () => {
    let printerData : Printer[] = [];

    physicalPrinters.forEach((printer) => {
        let text = printer.printer === 'neptune3' ? 'Printing' : 'Operational';
        printerData.push({
            printer: printer.printer,
            ip: printer.ip,
            temperature: {
                bed: { actual: 0, target: 0 },
                tool0: { actual: 0, target: 0 }
            },
            state: {
                text: text,
                flags: {
                    operational: true,
                    paused: false,
                    printing: false,
                    cancelling: false,
                    pausing: false,
                    error: false,
                    ready: false,
                    closedOrError: false
                }
            }
        });
    });

    return new Response(JSON.stringify(printerData), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};*/


export const GET: RequestHandler = async () => {
    const printerData = await Promise.all(physicalPrinters.map(async (printer) => {
        console.log('-----');
        console.log(printer);
        console.log(printer.ip);
        const printerIP = printer.ip;
        try {
            const response = await fetch(`${printerIP}/api/printer`);
            const data = await response.json();
            let returnData: Printer = {
                printer,
                ip: printerIP.replace('http://', ''),
                temperature: data.temperature,
                state: data.state
            };


            if (data.state.text === "Printing") {
                const printingStatus = await fetch(`${printerIP}/printer/objects/query?print_stats&display_status`);
                const printingData = await printingStatus.json();

                if (printingData?.result?.status?.display_status?.message === 'Printing') {
                    // @ts-ignore
                    returnData.printStatus = {
                        progress: printingData.result.status.display_status.progress,
                        message: printingData.result.status.display_status.message,
                        printDuration: printingData.result.status.print_stats.print_duration,
                        totalDuration: printingData.result.status.print_stats.total_duration,
                        filamentUsed: printingData.result.status.print_stats.filament_used,
                        filename: printingData.result.status.print_stats.filename
                    }
                }
            }
            return returnData;
        } catch (error) {
            return {
                printer,
                ip: printerIP.replace('http://', ''),
                error: 'Could not fetch data'
            };
        }
    }));

    return new Response(JSON.stringify(printerData), {
        status: 200,
        body: printerData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
