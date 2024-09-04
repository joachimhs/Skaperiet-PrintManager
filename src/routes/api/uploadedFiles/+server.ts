import type {RequestHandler} from "@sveltejs/kit";
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async ({ request }) => {
    //get a list of oll .stl files in the uploads folder
    //including the created date
    const directoryPath = '/app/uploads';
    const files = fs.readdirSync(directoryPath);
    const stlFiles = files
        .filter((file : string) => file.endsWith('.stl'))
        .map((file : string) => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            return {
                name: file,
                createdDate: stats.mtime ?  new Date(stats.mtime).toLocaleString('no-NO') : null
            };
        });

    let data = {
        uploadedFiles: stlFiles
    };
    
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}