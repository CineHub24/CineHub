<script lang="ts">
	import { generateQRCodeBase64 } from "$lib/utils/generateQR";

    const {data} = $props();
    const {code} = data;
    console.log(code);
</script>

<img src={code} alt={code}>