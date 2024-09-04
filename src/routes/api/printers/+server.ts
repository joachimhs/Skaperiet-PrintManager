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
    { printer: 'neptune4', ip: env.PRINTER_4 }
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
            return {
                printer,
                ip: printerIP.replace('http://', ''),
                temperature: data.temperature,
                state: data.state
            };
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
