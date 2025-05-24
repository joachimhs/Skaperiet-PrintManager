<script lang="ts">
    import {fetchPrinters, fetchPrinterProfiles, printerProfiles, startUploadedStlPrint} from "$lib/stores/printerStore";
    import {onMount, createEventDispatcher} from "svelte";
    import ChooseUploadedStlModal from "$lib/components/ChooseUploadedStlModal.svelte";
    import StlRenderer from "$lib/components/StlRenderer.svelte";

    export let printer;
    let showUploadedFilesModal = false;
    let file: File | null = null;
    let profile = 'profile1.ini';
    let message = '';

    let fileName = '';
    let uploadedFileName = '';
    let selectedFileChooserTab = 'stl';
    let uploading = false;

    const dispatch = createEventDispatcher();

    onMount(async () => {
        await fetchPrinterProfiles();
    });

    function doShowUploadedFiles() {
        showUploadedFilesModal = true;
    }

    function doHideUploadedFiles() {
        showUploadedFilesModal = false;
    }

    function selectUploadedFile(params) {
        console.log('Selected uploaded file:', params);
        let selectedFile = params.detail.file;
        uploadedFileName = null;
        uploadedFileName = selectedFile.name;
        console.log('UPLODED file name:', uploadedFileName);
    }

    const handleFileChange = () => {
        console.log(file.files);
        if (file.files.length > 0) {
            fileName = '';
            setTimeout(() => {
                fileName = file.files[0].name;
            }, 10);
        }
    };
    const uploadFile = async () => {
        message = 'Uploading...';
        uploading = true;

        const formData = new FormData();
        formData.append('file', file.files[0]);
        formData.append('profile', profile);
        formData.append('printer', JSON.stringify(printer));

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                message = data.message;
            } else {
                message = `Error: ${data.message}`;
            }

            // Refresh printer status
            //await refreshPrinterData();
        } catch (error) {
            message = `Error: ${error.message}`;
        }

        setTimeout(async () => {
            await fetchPrinters();
            uploading = false;
        }, 10000);

    };

    async function printPreviousFile() {
        console.log('Print previous file:', uploadedFileName);
        console.log('Selected printer:', printer);
        console.log('Selected profile:', profile);

        //TODO: call PrinterStore to print file
        if (uploadedFileName) {
            uploading = true;
            await startUploadedStlPrint(uploadedFileName, printer, profile);

            setTimeout(async () => {
                await fetchPrinters();
                uploading = false;
            }, 10000);
        }
    }

    const refreshPrinterData = async () => {

        const response = await fetch(`/api/printer-status?printer=${printer.printer.printer}`);
        const updatedPrinter = await response.json();
        console.log(updatedPrinter);
    };


</script>

{#if showUploadedFilesModal}
    <ChooseUploadedStlModal
            on:close={doHideUploadedFiles}
            on:uploadedFileChosen={selectUploadedFile}/>
{/if}

<div class="printer-box {printer.state.text === 'Operational' ? 'printer-box-green' : 'printer-box-red'}">
    <h3>Printer: {printer.printer?.printer}</h3>
    <img src="/images/neptune4.jpg" alt="Printer"/>
    {#if uploading}
        <div class="spinning-indicator">
            <i class="fa-solid fa-spinner fa-spin fa-2xl"></i>
            <div>Laster opp fil...</div>
        </div>
    {:else}
        <div class="printer-info-grid">
            <div class="printer-info-grid-left">IP:</div>
            <div class="printer-info-grid-right">{printer.ip}</div>

            <div class="printer-info-grid-left">Status</div>
            <div class="printer-info-grid-right">
                <span class="badge {printer.state.text === 'Operational' ? 'badge-operational' : 'badge-non-operational'}">{printer.state.text}</span>
            </div>

            <div class="printer-info-grid-left">Platetemp (nå/mål):</div>
            <div class="printer-info-grid-right">{printer.temperature.bed.actual}°C / {printer.temperature.bed.target}°C
            </div>

            <div class="printer-info-grid-left">Printtemp (nå/mål):</div>
            <div class="printer-info-grid-right">{printer.temperature.tool0.actual}°C / {printer.temperature.tool0.target}°C
            </div>
        </div>

        {#if printer.state.text == 'Operational'}
            <h2>Print på {printer.printer?.printer}</h2>
            <div class="tab-list">
                <button class="tab-button {selectedFileChooserTab === 'stl' ? 'tab-button-selected': ''}"
                     on:click={() => selectedFileChooserTab = 'stl'}>
                    Last opp fil
                </button>
                <button class="tab-button {selectedFileChooserTab === 'uploaded' ? 'tab-button-selected': ''}"
                     on:click={() => selectedFileChooserTab = 'uploaded'}>
                    Velg tidligere fil
                </button>
            </div>

            {#if selectedFileChooserTab === 'stl'}
                <form class="upload-form" on:submit|preventDefault={uploadFile} on:change={handleFileChange}
                      enctype="multipart/form-data" method="POST">
                    <div class="printer-info-grid">
                        <div class="printer-info-grid-left">Last opp fil:</div>
                        <div class="printer-info-grid-right"><input type="file" bind:this={file} accept=".stl" required/><br/>
                        </div>

                        <div class="printer-info-grid-left">Slicerprofil:</div>
                        <div class="printer-info-grid-right">
                            <select bind:value={profile}>
                                {#each $printerProfiles as profile}
                                    <option value={profile.filename}>{profile.description}</option>
                                {/each}
                            </select>
                        </div>

                        {#if fileName}
                            <div class="printer-info-grid-left">Fil valgt:</div>
                            <div class="printer-info-grid-right">{fileName}</div>

                            <div class="stl-box printer-info-grid-two-span">
                                Forhåndsvisning:
                                <StlRenderer stlFile={file.files[0]} />
                            </div>
                        {/if}

                        <div class="printer-info-grid-two-span">
                            <button class="upload-form-button" type="submit">Last opp, Slice og start printing!</button>
                        </div>
                    </div>
                </form>
            {:else if selectedFileChooserTab = 'uploaded'}
                <form class="upload-form" on:submit|preventDefault={printPreviousFile}>
                    <div class="printer-info-grid">
                        <div class="printer-info-grid-left">Velg fil:</div>
                        <div class="printer-info-grid-right">
                            <button class="show-use-uploaded-files-button" on:click={doShowUploadedFiles}>Velg en tidligere
                                opplastet fil
                            </button>
                        </div>

                        <div class="printer-info-grid-left">Slicerprofil:</div>
                        <div class="printer-info-grid-right">
                            <select bind:value={profile}>
                                {#each $printerProfiles as profile}
                                    <option value={profile.filename}>{profile.description}</option>
                                {/each}
                            </select>
                        </div>

                        {#if uploadedFileName}
                            <div class="printer-info-grid-left">Fil valgt:</div>
                            <div class="printer-info-grid-right">{uploadedFileName}</div>

                            <div class="stl-box printer-info-grid-two-span">
                                Forhåndsvisning:
                                <StlRenderer stlUrl="/api/stl/{uploadedFileName}" />
                            </div>
                        {/if}

                        <div class="printer-info-grid-two-span">
                            <button class="upload-form-button" type="submit">Velg fil og start print!</button>
                        </div>
                    </div>
                </form>
            {/if}

            <div style="margin-top: 10px; color: green;">{message}</div>
        {:else if printer.state.text === 'Printing'}
            <div>
                <h3 class="printer-box-red">Utskrift på vei :)</h3>
                <div class="printer-info-grid">
                    <div class="printer-info-grid-left">Filen som printes:</div>
                    <div class="printer-info-grid-right">{printer.printStatus? printer.printStatus.filename : '...'}</div>

                    <div class="printer-info-grid-left">Fremdrift:</div>
                    <div class="printer-info-grid-right">{printer.printStatus ? Math.floor(printer.printStatus.progress * 100) : '...'}%</div>

                    <div class="printer-info-grid-left">Tid benyttet:</div>
                    <div class="printer-info-grid-right">{printer.printStatus ? Math.ceil(printer.printStatus.printDuration / 60)  : '...'} minutter</div>

                    <div class="printer-info-grid-left">Tid igjen:</div>
                    <div class="printer-info-grid-right">{printer.printStatus ? Math.ceil(((printer.printStatus.printDuration / printer.printStatus.progress) - printer.printStatus.printDuration) / 60) : '...'} minutter</div>
                </div>
            </div>
        {:else}
            <div>
                <h3 class="printer-box-red">Printer er ikke operativ</h3>
                <div class="printer-info-grid">
                    <div class="printer-info-grid-two-span">Printeren er ikke klar for å ta i mot nye filer. Printeren har
                        status {printer.state.text}.
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .stl-box {
        width: 100%;
        height: 300px;
    }

    .stl-box-full-screen {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        height: 100vw;
    }

    .tab-list {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        position: relative; /* Necessary for positioning the pseudo-elements */
        width: 100%;
    }

    .tab-list::before,
    .tab-list::after {
        content: '';
        position: absolute;
        bottom: 0;
        height: 1px;
        background-color: #ccc;
        width: 100%; /* Make the border span the entire width */
    }

    .tab-list::before {
        left: 0;
        margin-right: auto; /* Push it to the left of the first tab */
        width: calc(50% - 120px); /* Adjust this value based on your tab width */
    }

    .tab-list::after {
        right: 0;
        margin-left: auto; /* Push it to the right of the last tab */
        width: calc(50% - 120px); /* Adjust this value based on your tab width */
    }

    .tab-button {
        background-color: #fff;
        width: 120px;
        color: #000;
        padding: 10px;
        border: 1px solid transparent; /* Make borders transparent initially */
        border-bottom: 1px solid #ccc; /* Add a bottom border */
        border-radius: 0; /* Ensure no rounded corners */
        cursor: pointer;
    }

    .tab-button-selected {
        border: 1px solid #ccc; /* Add borders to the selected button */
        border-top: 4px solid #2c772d;
        border-bottom: 0; /* Remove the bottom border from the selected button */
        border-radius: 3px 3px 0 0; /* Optional: Round top corners of selected tab */
    }


    .printer-box {
        border: 1px solid black;
        margin: 10px;
    }

    .printer-box img {
        width: 40%;
        height: auto;
        margin-left: 25%;
    }

    .printer-box h3 {
        font-size: 22px;
        margin-top: 0;
        margin-bottom: 20px;
        padding: 5px;
        text-align: center;
    }

    .printer-box-green h3 {
        background-color: #2c772d;
        color: #fff;
    }

    .printer-box-red h3 {
        background-color: #b05555;
        color: #fff;
    }

    h3.printer-box-yellow {
        background-color: #85843b;
        color: #fff;
    }

    .printer-box h2 {
        font-size: 22px;
        margin-top: 0;
        margin-bottom: 0;
        padding: 5px;
        background-color: #2c772d;
        color: #fff;
        text-align: center;
    }

    .printer-info-grid {
        display: grid;
        grid-template-columns: 200px 1fr;
        row-gap: 6px;
        padding: 10px;
    }

    .printer-info-grid-two-span {
        grid-column: 1 / span 2;
    }

    .upload-form {
        padding: 10px;
    }

    .upload-form input[type="file"] {
        width: 96%;
    }

    /* style the file input button as a material design button */
    .upload-form input[type="file"]::-webkit-file-upload-button {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 8px 25px 8px 25px;
        background-color: #2c772d;
        color: #fff;
        font-size: 15px;
        width: 100%;
    }

    .upload-form select {
        /* style as material design */
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 5px;
        width: 100%;
    }

    .upload-form-button {
        /* style as material design */
        border: 1px solid #ccc;
        border-radius: 15px;
        padding: 15px;
        width: 100%;
        background-color: #2c772d;
        color: #fff;
        font-size: 15px;
        margin-top: 25px;
    }

    .show-use-uploaded-files-button {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 8px 25px 8px 25px;
        background-color: #2c772d;
        color: #fff;
        font-size: 15px;
        width: 100%;
        margin-top: 0;
    }

    .badge {
        padding: 5px;
        border-radius: 5px;
        color: #fff;
        font-size: 15px;
    }

    .badge-operational {
        background-color: #2c772d;
    }

    .badge-non-operational {
        background-color: #b05555;
    }
</style>