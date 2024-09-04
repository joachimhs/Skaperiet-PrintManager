<script>
    import {fetchUploadedFiles, uploadedFiles} from '$lib/stores/printerStore';
    import {onMount} from 'svelte';
    import UploadedFile from './UploadedFile.svelte';

    onMount(async () => {
        await fetchUploadedFiles();
    });
</script>

<h1>Tidligere opplastede filer:</h1>
<div class="uploaded-files-grid">
    {#each $uploadedFiles as uploadedFile}
        <UploadedFile {uploadedFile}/>
    {/each}
</div>

<style>
    .uploaded-files-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, 300px);
        gap: 20px;
    }
</style>