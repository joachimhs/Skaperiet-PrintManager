<script lang="ts">
    import {fetchPrinters, printers, updatePrinters} from '$lib/stores/printerStore';
    import {createEventDispatcher, onMount} from 'svelte';
    import Printer from './Printer.svelte';

    const dispatch = createEventDispatcher();

    function showUploadedFilesModal(params) {
        console.log('Printers params:', params);
        let data = { profile: params.detail.profile, printer: params.detail.printer };
        dispatch('showUploadedFilesModal', data);
    }

    onMount(async () => {
        await fetchPrinters();
        setInterval(async () => {
            await updatePrinters()
        }, 25000);
    });
</script>

<div class="printer-grid">
    {#each $printers as printer (printer.printer)}
        <Printer {printer}
            on:showUploadedFilesModal={showUploadedFilesModal}/>
    {/each}
</div>

<style>
    .printer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
    }
</style>