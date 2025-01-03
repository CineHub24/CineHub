<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount, onDestroy } from 'svelte';
  import type { ActionData } from './$types';
  import { Html5Qrcode } from 'html5-qrcode';
  import { browser } from '$app/environment';
  
  export let form: ActionData & { success?: boolean; error?: string; message?: string };
  
  let html5QrCode: Html5Qrcode;
  let scanning = false;
  let scanResult = '';
  let readerElement: HTMLElement;
  
  onMount(() => {
  if (browser) {
  html5QrCode = new Html5Qrcode("reader");
  readerElement = document.getElementById("reader") as HTMLElement;
  startScanner();
  window.addEventListener('resize', handleResize);
  }
  });
  
  onDestroy(() => {
  if (browser && html5QrCode && scanning) {
  html5QrCode.stop().then(() => {
  window.removeEventListener('resize', handleResize);
  });
  }
  });
  
  function handleResize() {
  if (html5QrCode && scanning) {
  html5QrCode.stop().then(() => {
  startScanner();
  });
  }
  }
  
  async function startScanner() {
  if (!browser) return;
  
  try {
  scanning = true;
  
  const minDimension = Math.min(readerElement.offsetWidth, readerElement.offsetHeight);
  const qrboxSize = Math.floor(minDimension * 0.8); // 80% of the smaller dimension
  
  const config = {
  fps: 10,
  qrbox: { width: qrboxSize, height: qrboxSize },
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
  }, 5000);
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
  padding: 1rem;
  box-sizing: border-box;
  }
  
  #reader {
  width: 100%;
  max-height: 80vh;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  }
  
  .alert {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  font-size: clamp(12px, 2.5vw, 16px);
  }
  
  .success {
  background: #d4edda;
  color: #155724;
  }
  
  .error {
  background: #f8d7da;
  color: #721c24;
  }
  
  @media (max-width: 768px) {
  .scanner-container {
  padding: 0.5rem;
  }
  
  #reader {
  max-height: 70vh;
  }
  }
  
  @media (max-width: 480px) {
  #reader {
  max-height: 60vh;
  }
  
  .alert {
  padding: 0.75rem;
  }
  }
  </style>