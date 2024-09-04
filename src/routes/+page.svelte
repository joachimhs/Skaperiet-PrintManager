<script lang="ts">
    import {fetchPrinterProfiles, printerProfiles} from "$lib/stores/printerStore";
    import {onMount} from "svelte";
    import Printers from '$lib/components/Printers.svelte';
    import UploadedFiles from "$lib/components/UploadedFiles.svelte";
    import ChooseUploadedStlModal from "$lib/components/ChooseUploadedStlModal.svelte";
    import type {PrinterProfile} from "$lib/types/PrinterProfile";
    import StlRenderer from "$lib/components/StlRenderer.svelte";

    let showUploadedFilesModal = false;
    let selectedPrinterProfile: PrinterProfile | null = null;
    let selectedPrinter: Printer | null = null;

    onMount(async () => {
        await fetchPrinterProfiles();
    });

    function doShowUploadedFiles(params) {
        console.log('Page params:', params);
        selectedPrinterProfile = params.detail.profile;
        selectedPrinter = params.detail.printer;
        showUploadedFilesModal = true;
    }

    function doHideUploadedFiles() {
        selectedPrinterProfile = null;
        selectedPrinter = null;
        showUploadedFilesModal = false;
    }

    function printUploadedFile(params) {
        let selectedFile = params.detail.file;
    }
</script>

<main>
    <div class="header-short">
        <div class="header-links-short">
            <div class="header-links-left"><a href="/"><img src="/images/skaperiet_logo_white.png"></a></div>
            <div class="header-links-center">&nbsp;</div>
        </div>
    </div>
    <div class="page-content">
        <p>Her kan du se status på 3D printerne til Skaperiet. Dersom en printer er ledig/grønn (status som
            "Operational"),
            kan du sende en STL fil til den. Start med å velge en .STL fil fra din datamaskin. Deretter kan du velge
            hvilken printer profil du vil bruke.
        </p>

        <ul>
            {#each $printerProfiles as profile}
                <li>{profile.filename}: {profile.longDescription}</li>
            {/each}
        </ul>

        <p>Når du trykker på "Last opp"-knappen, vil filen bli Slicet med den valgte profilen med programmet
            PrusaSlicer (version 2.5.0), før den blir lastet opp til 3D printeren. <span class="strong">Dersom alt går OK,
            vil printeren starte utskriften av figuren din! Husk at du må bytte fargen på plasten på printeren før
                du laster opp filen, dersom du vil ha en annen farge enn den som er på printeren fra før</span>.
        </p>

        <Printers/>
    </div>
</main>

<style>
    .stl-area {
        width: 500px;
        height: 500px;
    }
    :global(body) {
        font-family: sans-serif;
        line-height: 1.15;
        font-weight: 100;
        width: 100vw;
        overflow-x: hidden;
        margin: 0;
    }

    .strong {
        font-weight: bold;
    }

    .page-content {
        padding: 10px 20px 20px 20px;
    }

    h2 {
        margin-top: 0;
        text-align: center;
    }

    .header-short {
        color: rgb(255, 255, 255);
        line-height: 50px;
        z-index: 100;
        padding: 10px 20px 10px 10px;
        background: 0% 0% / cover no-repeat rgb(32, 119, 112);
    }

    .header-links-short {
        display: grid;
        grid-template-columns: 25vw 25vw 1fr;
    }

    .header-links-left {
        color: rgb(255, 255, 255);
    }

    .header-links-left img {
        color: rgb(255, 255, 255);
        float: left;
        height: 50px;
    }

    .header-links-center {
        text-align: right;
        font-size: clamp(15px, 2vw, 25px);
        color: rgba(255, 255, 255, 0.68);
    }

    .header-short::after {
        content: "- Skaperverksted på alvor! -";
        position: absolute;
        color: rgba(255, 255, 255, 0.68);
        top: -40px;
        left: calc(-320px + 50vw);
        z-index: 0;
        font-size: clamp(15px, 2vw, 25px);
        width: 350px;
        text-align: center;
        margin: 3rem;
    }
</style>