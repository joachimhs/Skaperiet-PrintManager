import type { RequestHandler } from './$types';
import path from 'path';
import fs from 'fs';
import {slliceAndUpload} from "$lib/PrinterCommunicator";


export const POST: RequestHandler = async ({ request, url }) => {
    let formData = await request.formData();
    let file = formData.get('file');
    const profile = formData.get('profile') ? formData.get('profile') : null;
    let printer = formData.get('printer') ? JSON.parse(<string>formData.get('printer')) : null;

    if (!file || !profile || !printer) {
        return new Response(JSON.stringify({ success: false, message: 'File upload failed' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    //cast file to an actual File object
    const fileObj = file as File;
    const filename = fileObj.name.replace(/\s+/g, '_');

    //save the file to disk
    const buffer = new Uint8Array(await fileObj.arrayBuffer());
    const filePath = path.join('/app/uploads', filename);

    // Write the file to the disk
    await fs.writeFileSync(filePath, buffer);

    let sliceAndUploadSuccess = await slliceAndUpload(filename, printer, profile);

    return new Response(JSON.stringify({ success: sliceAndUploadSuccess}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};


