import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';
import {slliceAndUpload} from "$lib/PrinterCommunicator";

export const POST: RequestHandler = async ({ request, url }) => {
    const { filename, profile, printer } = await request.json();

    console.log('slicing previous file: ', filename);
    let sliceAndUploadSuccess = await slliceAndUpload(filename, printer, profile);

    return new Response(JSON.stringify({ success: sliceAndUploadSuccess}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
