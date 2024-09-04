<script>
    export let uploadedFile;
</script>

<div class="uploaded-file">
    <div class="uploaded-file-info">
        <p><span class="strong">Filename:</span> {uploadedFile.name}</p>
        <p><span class="strong">Lastet opp:</span> {uploadedFile.createdDate}</p>
    </div>
    <div class="uploaded-file-actions">
        <button class="button">Download</button>
        <button class="button">Delete</button>
    </div>
</div>