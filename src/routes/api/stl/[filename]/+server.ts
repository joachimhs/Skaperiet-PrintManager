import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { filename } = params;

    // Define the directory where the STL files are stored
    const uploadsDir = '/app/uploads';

    // Construct the full file path
    const filePath = path.join(uploadsDir, filename);

    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            throw error(404, 'File not found');
        }

        // Read the file content
        const fileBuffer = fs.readFileSync(filePath);

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.ms-pkistl',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        throw error(500, 'Server error');
    }
};
