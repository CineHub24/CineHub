<script lang="ts">
	import { createEventDispatcher } from "svelte";
    export let url: string;
    
    const dispatch = createEventDispatcher();
    
    function close() {
    dispatch('close');
    }
    </script>
    
    <style>
    .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    }
    .popup-content {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    position: relative;
    }
    .close-button {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #f00;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 20px;
    cursor: pointer;
    }
    </style>
    
    <div class="popup">
    <div class="popup-content">
    <button class="close-button" on:click={close}>&times;</button>
    {#if url}
    <iframe
    width="1120"
    height="630"
    src={url}
    frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
    title="Trailer"
    ></iframe>
    {:else}
    <p>Trailer nicht verfügbar.</p>
    {/if}
    </div>
    </div>