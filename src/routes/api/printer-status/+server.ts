import type { RequestHandler } from '@sveltejs/kit';
import { printers } from '$lib/stores/printerStore';
import {get} from "svelte/store";

export const GET: RequestHandler = async ({ url }) => {
    const printer = url.searchParams.get('printer');
    console.log('-_-_-___---')
    console.log(printers)
    console.log(printer)

    //iterate over printers and find wher printer.printer matches printer-variable
    //return printer and ip

    let printerIP = '';
    let foundPrinter = get(printers).find((p) => {
        console.log(p);
        return p.printer.printer === printer
    });

    if (foundPrinter) {
        printerIP = foundPrinter.printer.ip;
    }

    console.log(printerIP);

    try {
        const response = await fetch(`${printerIP}/api/printer`);
        const data = await response.json();

        let returnData = {
            printer,
            ip: printerIP.replace('http://', ''),
            temperature: data.temperature,
            state: data.state
        };

        return new Response(JSON.stringify(returnData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Could not fetch printer data.' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
