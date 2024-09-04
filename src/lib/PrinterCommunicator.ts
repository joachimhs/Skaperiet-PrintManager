import {Mutex} from '$lib/Mutex';
import type {Printer} from "$lib/types/Printer";
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const sliceMutex = new Mutex();

export const slliceAndUpload = async  (filename: string, printer: Printer, profile: string): Promise<boolean> => {
    const gcodeFileName = await sliceSTL(filename, profile);
    console.log(`G-code file created: ${gcodeFileName}. Uploading and starting print on ${printer.printer}`);
    return await uploadAndStartPrint(printer, gcodeFileName);

}
// Slicing function using PrusaSlicer CLI
const sliceSTL = (file : string, profile: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileNameWithoutExt = path.basename(file, path.extname(file));
        const gcodefileName = `${fileNameWithoutExt}.gcode`;
        console.log(`Slicing ${file} using ${profile}`);

        const command = `prusa-slicer --export-gcode --load /app/profiles/${profile} -g -o /app/uploads/${gcodefileName} /app/uploads/${file}`;
        console.log(`Executing: ${command}`);

        try {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    return reject(`Slicing error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`Slicing stderr: ${stderr}`);
                }
                console.log(`Slicing stdout: ${stdout}`);
                resolve(gcodefileName);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Upload G-code to printer
const uploadAndStartPrint = async (printer: Printer, gcodefileName: string): Promise<boolean> => {
    console.log(`Uploading and starting print on ${printer.printer} ip: ${printer.ip}`)

    let url = `${printer.ip}/api/files/local`;
    if (!url.startsWith("http")) {
        url = `http://${url}`;
    }

    let command = `curl -X POST -H "Content-Type: multipart/form-data" -F "file=@/app/uploads/${gcodefileName}" -F "select=true" -F "print=true" ${url}`;
    console.log(`Executing: ${command}`);

    let uploadSuccessful = false;
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Upload and print error: ${error.message}`);
                uploadSuccessful = false;
                throw error;
            }
            if (stderr) {
                uploadSuccessful = false;
                console.error(`Upload and print stderr: ${stderr}`);
            }
            uploadSuccessful = true;
            console.log(`Upload and print stdout: ${stdout}`);
        });
    } catch (error) {
        uploadSuccessful = false;
        console.error(`Upload and print error: ${error.message}`);
    }

    return uploadSuccessful;

    /*const fileStream = fs.createReadStream('/app/uploads/' + gcodefileName);

    const form : FormData = new FormData();
    form.append('file', fileStream);
    form.append('select', 'true');  // Automatically select the file after upload
    form.append('print', 'true');   // Start the print immediately after selecting

    console.log(form);

    try {
        // Upload the G-code file and start the print
        console.log(`Uploading ${gcodefileName} to ${printer.printer} on ip ${printer.ip} to ${url}`);
        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: form,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        if (!uploadResponse.ok) {
            console.log(uploadResponse);
            throw new Error(`Failed to upload and start print: ${uploadResponse.statusText}`);
        }

        console.log(`File uploaded and print started: ${gcodefileName}`);
        return uploadResponse;
    } catch (error) {
        console.error(`Upload and print error: ${error.message}`);
        throw error;
    }*/
};