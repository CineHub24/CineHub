<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData, SubmitFunction } from './$types';
  
  export let data: PageData;
  const { selectedFilm, priceSets, cinemas} = data;
  let {halls} = data;
  console.log( "initial: " + halls);
  export let form: ActionData;
  
  let filmRuntime = selectedFilm.runtime;
  let selectedDate = new Date().toISOString().slice(0, 10);
  let priceSet = 0;
  let selectedTimeWindow: { start: string; end: string; duration: number } | null = null;
  let selectedStartTime: string = '';
  let selectedHall: number | null = null;
  
  let cleaningTime = 15;
  let advertisementTime = 15;
  
  $: totalDuration = Number(filmRuntime) + cleaningTime + advertisementTime;
  
  $: if (selectedTimeWindow) {
    selectedStartTime = selectedTimeWindow.start;
  }
  
  let selectedCinema: number | null = null;


function handleCinemaSelect(event: Event) {
  const select = event.target as HTMLSelectElement;
  selectedCinema = parseInt(select.value);
  console.log(selectedCinema);
  console.log(halls);
  halls = halls.filter(hall => hall.cinemaId === selectedCinema);
  console.log(halls);
}
  function handleTimeWindowSelect(timeWindow: { start: string; end: string | null; duration: number }) {
    selectedTimeWindow = { ...timeWindow, end: timeWindow.end || '' };
  }
  
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }

  function isValidTime(time: string, start: string, end: string): boolean {
    if (!/^\d{2}:\d{2}$/.test(time)) return false;
    console.log(time, start, end);
      
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;
    
    const timeDate = new Date(`1970-01-01T${time}`);
    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);
    
    const endTime = new Date(timeDate.getTime() + (totalDuration * 60000));
    return timeDate >= startDate && endTime <= endDate;
  }

  function getEndTime(startTime: string): string {
    if (!startTime) return '';
    const start = new Date(`1970-01-01T${startTime}`);
    
    let end = new Date(start.getTime() + (totalDuration * 60000));
    if(end.getHours() == 0 && end.getMinutes() == 0){
      end = new Date(`1970-01-01T24:00`);
    }
    return end.toTimeString().slice(0, 5);
  }

  $: isValidStartTime = selectedTimeWindow 
    ? isValidTime(selectedStartTime, selectedTimeWindow.start, selectedTimeWindow.end)
    : false;
  
  $: calculatedEndTime = selectedStartTime && isValidStartTime 
    ? getEndTime(selectedStartTime)
    : null;

  const enhanceTimeWindows: SubmitFunction = () => {
    return async ({ update }) => {
      const currentRuntime = filmRuntime;
      const currentPriceSet = priceSet;
      const currentHall = selectedHall;
      await update({ reset: false });
      filmRuntime = currentRuntime;
      priceSet = currentPriceSet;
      selectedHall = currentHall;
      
    };
  };

  const enhanceSaveShowing: SubmitFunction = () => {
    return async ({ update }) => {
      await update({ reset: false });
    };
  };
</script>

<div class="p-4">
  <h1 class="text-2xl mb-4">Vorführungszeit planen</h1>
  
  <form 
    method="POST" 
    action="?/getTimeWindows" 
    use:enhance={enhanceTimeWindows}
    class="mb-8 space-y-4"
  >
    <div>
      <label for="cinemaId" class="block mb-2">Kino</label>
      <select
        name="cinemaId" 
        id="cinemaId" 
        class="w-full p-2 border rounded" 
        required
        on:change={()=> {
          handleCinemaSelect;
        }}
        bind:value={selectedCinema}
      >

        {#each cinemas as cinema}
          <option value={cinema.id}>{cinema.name}</option>
        {/each}
      </select>
    </div>
    
    {#if selectedCinema && halls.length > 0}
      <div>
        <label for="hallId" class="block mb-2">Saal</label>
        <select name="hallId" id="hallId" class="w-full p-2 border rounded" bind:value={selectedHall} required>
          <option value="">Saal auswählen</option>
          {#each halls as hall}
            <option value={hall.id}>{hall.name}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="date" class="block mb-2">Datum</label>
        <input 
          type="date" 
          name="date" 
          id="date"
          bind:value={selectedDate}
          class="w-full p-2 border rounded"
          required
        >
      </div>
      
      <div>
        <label for="duration" class="block mb-2">Filmdauer (Minuten)</label>
        <input 
          type="number" 
          name="duration" 
          id="duration"
          bind:value={filmRuntime}
          min="1"
          class="w-full p-2 border rounded"
          required
        >
      </div>

      <div>
        <label for="priceset" class="block mb-2">Preisset</label>
        <select name="priceset" id="priceset" bind:value={priceSet}>
          {#each priceSets as priceSet}
            <option value={priceSet.id}>{priceSet.name}</option>
          {/each}
        </select>
      </div>
      
      <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Verfügbare Zeitfenster suchen
      </button>
    {/if}
  </form>
  
  {#if form?.success && form.timeWindows}
    <div class="mb-8">
      <h2 class="text-xl mb-4">Verfügbare Zeitfenster</h2>
      <div class="space-y-2">
        {#each form.timeWindows as window}
          <button
            class="w-full p-4 border rounded hover:bg-gray-50 text-left"
            class:bg-blue-50={selectedTimeWindow?.start === window.start}
            on:click={() => handleTimeWindowSelect({ start: window.start ?? "", end: window.end ?? '', duration: window.duration })}
          >
            {window.start} - {window.end}
            <span class="text-gray-500 ml-2">
              ({formatDuration(window.duration)})
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  {#if selectedTimeWindow}
    <div class="mb-8 p-4 border rounded bg-gray-50">
      <h3 class="text-lg mb-4">Startzeit wählen</h3>
      <div class="space-y-4">
        <div>
          <p class="mb-2">Verfügbarer Zeitraum: {selectedTimeWindow.start} - {selectedTimeWindow.end}</p>
          <p class="text-sm text-gray-600">
            Benötigte Zeit: {formatDuration(totalDuration)}
            <span class="text-xs text-gray-500">
              (Film: {formatDuration(filmRuntime as number)}, 
              Reinigung: {formatDuration(cleaningTime)}, 
              Werbung: {formatDuration(advertisementTime)})
            </span>
          </p>
        </div>
        
        <div>
          <label for="startTime" class="block mb-2">Startzeit (HH:MM)</label>
          <input 
            type="time"
            id="startTime"
            bind:value={selectedStartTime}
            class="w-full p-2 border rounded"
            min={selectedTimeWindow.start}
            max={selectedTimeWindow.end}
          />
        </div>

        {#if selectedStartTime}
          {#if isValidStartTime}
            <div class="p-2 bg-green-100 rounded">
              <p>Vorführungszeit:</p>
              <p>Start: {selectedStartTime}</p>
              <p>Ende: {calculatedEndTime}</p>
              <p class="text-sm text-gray-600">Gesamtdauer: {formatDuration(totalDuration)}</p>
            </div>
          {:else}
            <p class="text-red-500">
              Die gewählte Zeit passt nicht in das Zeitfenster (benötigte Zeit: {formatDuration(totalDuration)})
            </p>
          {/if}
        {/if}

        {#if isValidStartTime}
          <form 
            method="POST" 
            action="?/saveShowing" 
            use:enhance={enhanceSaveShowing}
          >
            <input type="hidden" name="startTime" value={selectedStartTime}>
            <input type="hidden" name="endTime" value={calculatedEndTime}>
            <input type="hidden" name="totalDuration" value={totalDuration}>
            <input type="hidden" name="filmId" value={selectedFilm.id}>
            <input type="hidden" name="hallId" value={selectedHall}>
            <input type="hidden" name="date" value={selectedDate}>
            <input type="hidden" name="priceSet" value={priceSet}>
            <button 
              type="submit" 
              class="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Vorführung speichern
            </button>
          </form>
        {/if}
      </div>
    </div>
  {/if}
  
  {#if form?.error}
    <div class="p-4 bg-red-100 text-red-700 rounded mb-4">
      {form.error}
    </div>
  {/if}
</div>