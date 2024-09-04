const dns = require('dns');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const FormData = require('form-data');

const app = express();
const port = 5000;

// Configure Multer for file uploads with original filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Set the destination to the /uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.replaceAll(" ", "_"));  // Keep the original filename
    }
});

const upload = multer({ storage: storage });

// Define the printer configurations
const printers = {
    'neptune1': process.env.PRINTER_1,
    'neptune2': process.env.PRINTER_2,
    'neptune3': process.env.PRINTER_3,
    'neptune4': process.env.PRINTER_4
};

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve a simple form for uploading files
app.get('/', async (req, res) => {
    try {
        // Fetch printer data from all printerStore
        const printerData = await Promise.all(Object.keys(printers).map(async (printer) => {
            const printerIP = printers[printer];
            try {
                const response = await axios.get(`${printerIP}/api/printer`);
                return {
                    printer,
                    ip: printerIP.replace('http://', ''),
                    temperature: response.data.temperature,
                    state: response.data.state
                };
            } catch (error) {
                console.error(`Error fetching data from ${printer}: ${error.message}`);
                return {
                    printer,
                    ip: printerIP.replace('http://', ''),
                    error: 'Could not fetch data'
                };
            }
        }));

        // Build the HTML for the grid
        const printerGrid = printerData.map(printer => {
            if (printer.error) {
                return `
                    <div id="${printer.printer}-container" style="border: 1px solid black; padding: 10px; margin: 10px; background-color: lightcoral;">
                        <h3>${printer.printer} (${printer.ip})</h3>
                        <p style="color: red;">${printer.error}</p>
                    </div>
                `;
            } else {
                // Determine background color based on operational status
                const backgroundColor = printer.state.text === 'Operational' ? 'lightgreen' : 'lightcoral';

                // Iterate over the flags and generate a list
                const flagsList = Object.keys(printer.state.flags).map(flag => {
                    return `<li>${flag}: ${printer.state.flags[flag]}</li>`;
                }).join('');

                // Display the printer with its own upload form if operational
                const uploadForm = printer.state.text === 'Operational' ? `
                    <form class="uploadForm" data-printer="${printer.printer}" enctype="multipart/form-data">
                        <input type="hidden" name="printer" value="${printer.printer}">
                        <input type="file" name="file" accept=".stl" required /><br />
                        <select name="profile" required>
                            <option value="profile1.ini">Standard printerprofil</option>
                            <!-- Add more profiles as needed -->
                        </select><br />
                        <button type="submit">Upload and Slice!</button>
                    </form>
                    <div id="${printer.printer}-message" class="message" style="color: green; margin-top: 10px;"></div>
                ` : '';

                return `
                    <div id="${printer.printer}-container" style="border: 1px solid black; padding: 10px; margin: 10px; background-color: ${backgroundColor};">
                        <h3>${printer.printer} (${printer.ip})</h3>
                        <p>Bed Temperature: ${printer.temperature.bed.actual}°C (Target: ${printer.temperature.bed.target}°C)</p>
                        <p>Tool Temperature: ${printer.temperature.tool0.actual}°C (Target: ${printer.temperature.tool0.target}°C)</p>
                        <p>Status: ${printer.state.text}</p>
                        <p>Flags:</p>
                        <ul>${flagsList}</ul>
                        ${uploadForm}
                    </div>
                `;
            }
        }).join('');

        // Send the form and the grid as the response with the script for AJAX
        res.send(`
            <h2>Printer Statuses</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                ${printerGrid}
            </div>

            <script>
                document.querySelectorAll('.uploadForm').forEach(form => {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const formData = new FormData(this);
                        const printer = this.dataset.printer;
                        const container = document.getElementById(printer + '-container');
                        const messageDiv = document.getElementById(printer + '-message');

                        // Show the "uploading" state
                        container.innerHTML = "<p>Uploading...</p>";

                        fetch('/upload', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            // Update the printer status
                            fetch('/api/printer-status?printer=' + printer)
                            .then(response => response.json())
                            .then(printerData => {
                                const newContent = \`
                                    <h3>\${printerData.printer} (\${printerData.ip})</h3>
                                    <p>Bed Temperature: \${printerData.temperature.bed.actual}°C (Target: \${printerData.temperature.bed.target}°C)</p>
                                    <p>Tool Temperature: \${printerData.temperature.tool0.actual}°C (Target: \${printerData.temperature.tool0.target}°C)</p>
                                    <p>Status: \${printerData.state.text}</p>
                                    <p>Flags:</p>
                                    <ul>\${Object.keys(printerData.state.flags).map(flag => \`<li>\${flag}: \${printerData.state.flags[flag]}</li>\`).join('')}</ul>
                                    <div id="\${printer}-message" class="message" style="color: green; margin-top: 10px;">Model sent to printer. Print starting.</div>
                                \`;

                                container.innerHTML = newContent;
                            });
                        })
                        .catch(error => {
                            container.innerHTML = "<p style='color: red;'>Error sending model to printer: " + error.message + "</p>";
                        });
                    });
                });
            </script>
        `);
    } catch (error) {
        res.status(500).send('An error occurred while fetching printer data.');
    }
});

app.get('/api/printer-status', async (req, res) => {
    const printer = req.query.printer;
    const printerIP = printers[printer];
    try {
        const response = await axios.get(`${printerIP}/api/printer`);
        res.json({
            printer,
            ip: printerIP.replace('http://', ''),
            temperature: response.data.temperature,
            state: response.data.state
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch printer data.' });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    file.originalname = file.originalname.replaceAll(" ", "_");
    const profile = req.body.profile;
    const printer = req.body.printer;

    try {
        // Slice the STL file using PrusaSlicer
        const gcodefileName = await sliceSTL(file, profile);

        // Upload the G-code file to the selected printer
        console.log(`Uploading ${gcodefileName} to ${printer}`);
        const response = await uploadAndStartPrint(printer, gcodefileName);

        res.json({ success: true, message: 'Model sent to printer. Print starting.' });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Slicing function using PrusaSlicer CLI
const sliceSTL = (file, profile) => {
    return new Promise((resolve, reject) => {
        const fileNameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
        const gcodefileName = `${fileNameWithoutExt}.gcode`;
        const gcodeFilePath = path.join('uploads', `${fileNameWithoutExt}.gcode`);
        console.log(`Slicing ${file.path} using ${profile}`);

        const command = `prusa-slicer --load /app/profiles/${profile} -g -o /app/${gcodeFilePath} /app/${file.path}`;
        console.log(`Executing: ${command}`);

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
    });
};

// Upload G-code to printer
const uploadAndStartPrint = async (printer, gcodeFileName) => {
    const url = `${printers[printer]}/api/files/local`;
    const fileStream = fs.createReadStream('/app/uploads/' + gcodeFileName);

    const form = new FormData();
    form.append('file', fileStream);
    form.append('select', 'true');  // Automatically select the file after upload
    form.append('print', 'true');   // Start the print immediately after selecting


    try {
        // Upload the G-code file and start the print
        console.log(`Uploading ${gcodeFileName} to ${printer}`);
        const uploadResponse = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
                'X-Start-Print': 'true',  // Header to automatically start the print
            },
        });

        console.log(`File uploaded and print started: ${gcodeFileName}`);
        return uploadResponse;
    } catch (error) {
        console.error(`Upload and print error: ${error.message}`);
        throw error;
    }
};

app.listen(port, '0.0.0.0', async () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log("printerStore available at: ", printers);
});
