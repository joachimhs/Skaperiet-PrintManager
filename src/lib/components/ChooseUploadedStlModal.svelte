<script>
    import {fetchUploadedFiles, uploadedFiles} from "$lib/stores/printerStore";
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher();

    let filterFilename = "";

    onMount(async () => {
        await fetchUploadedFiles();
    });

    function doCloseModal() {
        dispatch('close');
    }

    function chooseUploadedFile(uploadedFile) {
        console.log("Choose uploaded file:", uploadedFile);
        dispatch('uploadedFileChosen', {file: uploadedFile});
        dispatch('close');
    }

    function downloadFile(uploadedFile) {
        window.open('/api/stl/' + uploadedFile.name);
    }

    export let printerProfile;
    export let printer;

    $: filteredUploadedFiles = $uploadedFiles.filter(file => file.name.toLowerCase().includes(filterFilename.toLowerCase()));
</script>

<div class="uploaded-files-modal">
    <div class="uploaded-files-area">
        <button class="button close-button" on:click={doCloseModal}>Lukk</button>
        <h1>Velg en tidligere opplastet fil:</h1>
        <form>
            <input class="form-control" type="text" bind:value={filterFilename} placeholder="Søk etter filnavn" />
        </form>

        <div class="uploaded-files-grid">

            {#each filteredUploadedFiles as uploadedFile}
                <div class="uploaded-file">
                    <div class="uploaded-file-info">
                        <p><span class="strong">Filnavn:</span> <br /> {uploadedFile.name}</p>
                        <p><span class="strong">Lastet opp:</span> <br />{uploadedFile.createdDate}</p>
                    </div>
                    <div class="uploaded-file-actions">
                        <button class="button action-button" on:click={chooseUploadedFile(uploadedFile)}>Velg fil</button>
                        <button class="button action-button" on:click={downloadFile(uploadedFile)}>Last ned</button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .uploaded-files-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .uploaded-files-area {
        position: relative;
        width: 90vw;
        height: 90vh;
        padding: 20px;
        border-radius: 25px;
        background-color: rgba(255, 255, 255);
    }

    .uploaded-files-area h1 {
    }

    .uploaded-files-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        max-height: 100%;
        overflow-y: auto;
    }

    .uploaded-file-info p {
        max-width: 100%;
        overflow: hidden;
    }

    .strong {
        font-weight: 900;
    }

    /*
        float right and material design
     */
    .close-button {
        float: right;
        background-color: #f44336;
        color: white;
    }

    .action-button {
        background-color: #2c772d;
        color: white;
    }

    .button {
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 12px;
        margin: 4px 2px;
        cursor: pointer;
    }

    .form-control {
        /* style as material design */
        border: none;
        border: 1px solid #2c772d;
        border-radius: 25px;
        padding: 15px;
        margin: 10px 0;
        width: 98%;
        background-color: #e3ffe3;
    }
</style>