// src/routes/scanner/+page.svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount, onDestroy } from 'svelte';
  import type { ActionData } from './$types';
  import { Html5Qrcode } from 'html5-qrcode';
  
  export let form: ActionData & { success?: boolean; error?: string; message?: string };
  
  let html5QrCode: Html5Qrcode;
  let scanning = false;
  let scanResult = '';
  
  onMount(async () => {
    html5QrCode = new Html5Qrcode("reader");
    startScanner();
  });
  
  onDestroy(async () => {
    if (html5QrCode && scanning) {
      await html5QrCode.stop();
    }
  });
  
  async function startScanner() {
    try {
      scanning = true;
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      
    } catch (err) {
      console.error('Fehler beim Starten des Scanners:', err);
      scanning = false;
    }
  }
  
  async function onScanSuccess(decodedText: string) {
    if (!scanning) return;
    
    scanning = false;
    scanResult = decodedText;
    console.log('QR-Code gescannt:', decodedText);
    
    await html5QrCode.pause();
    
    // Automatisch das Formular absenden
    const formElement = document.getElementById('scanForm') as HTMLFormElement;
    formElement.requestSubmit();
  }
  
  function onScanFailure(error: string) {
    // Fehler beim Scannen - hier können wir sie ignorieren,
    // da sie häufig auftreten wenn kein QR-Code im Bild ist
  }
  
  // Scanner nach Validierung wieder starten
  $: if (form?.success || form?.error) {
    setTimeout(async () => {
      if (html5QrCode) {
        await html5QrCode.resume();
        scanning = true;
      }
    }, 2000);
  }
</script>

<div class="scanner-container">
  <div id="reader"></div>
  
  <form
    id="scanForm"
    method="POST"
    action="?/validate"
    use:enhance
  >
    <input type="hidden" name="ticketData" value={scanResult}>
  </form>
  
  {#if form?.success}
    <div class="alert success">
      {form.message}
    </div>
  {/if}
  
  {#if form?.error}
    <div class="alert error">
      {form.error}
    </div>
  {/if}
</div>

<style>
  .scanner-container {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
  }
  
  #reader {
    width: 100%;
  }
  
  .alert {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .success {
    background: #d4edda;
    color: #155724;
  }
  
  .error {
    background: #f8d7da;
    color: #721c24;
  }
</style>