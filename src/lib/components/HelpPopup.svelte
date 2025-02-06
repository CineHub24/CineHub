<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Erzeuge einen Dispatcher, um z. B. ein "close"-Event an den Parent zu senden
  const dispatch = createEventDispatcher();

  // Sichtbarkeit des Popups (als Prop übergeben)
  export let visible: boolean = false;

  // HTML-Inhalt der Anleitung (in Deutsch)
  const content = `
    <h2>Inhaltsverzeichnis</h2>
    <ol>
      <li><a href="#übersicht">Übersicht</a></li>
      <li><a href="#grundlegende-bedienung">Grundlegende Bedienung</a></li>
      <li><a href="#sitze-hinzufügen">Sitze hinzufügen</a></li>
      <li><a href="#sitze-verschieben-und-ausrichten">Sitze verschieben und ausrichten</a></li>
      <li><a href="#bearbeiten-von-sitzpositionen">Bearbeiten von Sitzpositionen</a></li>
      <li><a href="#sitzreihen-zuweisen-und-nummerieren">Sitzreihen zuweisen und nummerieren</a></li>
      <li><a href="#speichern-des-layouts">Speichern des Layouts</a></li>
      <li><a href="#hilfefunktion">Hilfefunktion</a></li>
      <li><a href="#tastaturkürzel">Tastaturkürzel</a></li>
    </ol>
    
    <h3 id="übersicht">1. Übersicht</h3>
    <p>
      Der Sitzplan-Editor erlaubt es dir, einen Raum (z. B. einen Kinosaal) visuell zu planen. 
      Du kannst Sitzplätze per Drag & Drop hinzufügen, verschieben, ausrichten, duplizieren, löschen und nummerieren. 
      Über den Editor werden alle Änderungen gespeichert – du kannst auch per Undo wieder zum letzten Zustand zurückkehren.
    </p>
    
    <h3 id="grundlegende-bedienung">2. Grundlegende Bedienung</h3>
    <h4>Sitzplan erstellen / öffnen</h4>
    <ul>
      <li><strong>Neuen Sitzplan erstellen:</strong> Beim Aufruf des Editors wählst du einen Namen für den Raum und einen zugehörigen Kinosaal aus.</li>
      <li><strong>Sitzplan laden:</strong> Bestehende Sitzpläne werden geladen, sodass alle platzierten Sitze sichtbar sind.</li>
    </ul>
    <h4>Bereich und Arbeitsfläche</h4>
    <ul>
      <li><strong>Obere Leiste:</strong> Enthält Eingabefelder (Raumname, Kinosaal) und eine Kategorienliste mit Sitztypen.</li>
      <li><strong>Arbeitsfläche:</strong> Hier gestaltest du den Sitzplan und siehst alle Sitzblöcke.</li>
    </ul>
    
    <h3 id="sitze-hinzufügen">3. Sitze hinzufügen</h3>
    <ul>
      <li><strong>Kategorie auswählen:</strong> Wähle einen Sitztyp aus der Kategorienliste.</li>
      <li><strong>Per Drag & Drop:</strong> Ziehe das ausgewählte Icon in die Arbeitsfläche. Der Sitz wird an der entsprechenden Position platziert.</li>
    </ul>
    
    <h3 id="sitze-verschieben-und-ausrichten">4. Sitze verschieben und ausrichten</h3>
    <h4>Drag & Drop</h4>
    <ul>
      <li><strong>Einzelne Sitze verschieben:</strong> Klicke einen Sitz an, halte die Maustaste gedrückt und ziehe ihn an die gewünschte Position.</li>
      <li><strong>Mehrfachauswahl:</strong> Halte die Strg- (oder Cmd-) Taste gedrückt, um mehrere Sitze auszuwählen.</li>
    </ul>
    <h4>Snap-Funktion und Ausrichtlinien</h4>
    <ul>
      <li>Beim Verschieben „rastet“ ein Sitz an nahegelegene Ausrichtungs- oder Musterpunkte ein.</li>
      <li>Hilfslinien (vertikal und horizontal) unterstützen dich bei der präzisen Ausrichtung.</li>
      <li>Mit gedrückter Shift-Taste wird die Snap-Funktion deaktiviert.</li>
    </ul>
    <h4>Mehrfachauswahl und Auswahlbox</h4>
    <ul>
      <li>Ziehe eine Auswahlbox in den leeren Bereich der Arbeitsfläche, um mehrere Sitze gleichzeitig auszuwählen.</li>
    </ul>
    
    <h3 id="bearbeiten-von-sitzpositionen">5. Bearbeiten von Sitzpositionen</h3>
    <h4>Duplizieren</h4>
    <ul>
      <li>Wähle einen oder mehrere Sitze aus und klicke auf „Duplicate“. Die Sitze werden kopiert und leicht versetzt hinzugefügt.</li>
    </ul>
    <h4>Löschen</h4>
    <ul>
      <li>Wähle die zu löschenden Sitze aus und klicke auf „Delete“ oder drücke die Delete-/Backspace-Taste.</li>
    </ul>
    <h4>Rückgängig machen (Undo)</h4>
    <ul>
      <li>Mit Undo (Strg+Z bzw. Cmd+Z) wird der letzte Bearbeitungsschritt rückgängig gemacht.</li>
    </ul>
    
    <h3 id="sitzreihen-zuweisen-und-nummerieren">6. Sitzreihen zuweisen und nummerieren</h3>
    <ul>
      <li>Wähle die Sitze aus, die zu einer Reihe gehören, und klicke auf „Assign Row“.</li>
      <li>Gib einen Buchstaben (A–Z) ein. Die Sitze werden automatisch von links nach rechts nummeriert.</li>
      <li>Sitze ohne Reihenbuchstabe oder Nummer werden als „Unassigned“ markiert.</li>
    </ul>
    
    <h3 id="speichern-des-layouts">7. Speichern des Layouts</h3>
    <ul>
      <li>Klicke auf „Save Room“, um den Sitzplan zu speichern.</li>
      <li>Vor dem Speichern wird überprüft, ob Raumname, Kinosaal und alle Sitzzuweisungen korrekt sind.</li>
      <li>Nach erfolgreichem Speichern erscheint eine Bestätigungsmeldung.</li>
    </ul>
    
    <h3 id="hilfefunktion">8. Hilfefunktion</h3>
    <ul>
      <li>Öffne die Hilfefunktion über den „Hilfe“-Button (normalerweise in der rechten unteren Ecke).</li>
      <li>Ein Popup zeigt alle wichtigen Informationen und Tipps an.</li>
    </ul>
    
    <h3 id="tastaturkürzel">9. Tastaturkürzel</h3>
    <ul>
      <li><strong>Shift:</strong> Deaktiviert temporär die Snap-Funktion.</li>
      <li><strong>Strg+Z / Cmd+Z:</strong> Rückgängig machen.</li>
      <li><strong>Strg+C / Cmd+C:</strong> Kopieren ausgewählter Sitze.</li>
      <li><strong>Strg+V / Cmd+V:</strong> Einfügen kopierter Sitze.</li>
      <li><strong>Delete / Backspace:</strong> Löschen ausgewählter Sitze.</li>
      <li><strong>R:</strong> Dreht die ausgewählten Sitze um einen festen Schritt (z. B. 15°).</li>
    </ul>
    
    <p><strong>Viel Erfolg beim Erstellen deines Sitzplans!</strong></p>
  `;

  // Funktion zum Schließen des Popups
  function closePopup() {
    dispatch('close');
  }
</script>

{#if visible}
  <!-- Overlay für den Modal-Hintergrund -->
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    on:click={closePopup}
  >
    <!-- Das eigentliche Popup-Fenster; on:click|stopPropagation verhindert das Schließen beim Klicken im Inneren -->
    <div
      class="bg-white p-6 rounded shadow-lg max-w-3xl mx-auto overflow-y-auto max-h-full"
      on:click|stopPropagation
    >
      <h2 class="text-2xl font-bold mb-4">Hilfe & Anleitung</h2>
      <!-- Der Inhalt wird als HTML eingefügt -->
      <div class="prose">
        {@html content}
      </div>
      <div class="mt-4 text-right">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          on:click={closePopup}
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Optionale Anpassungen der Stile */
  .prose {
    max-width: 100%;
  }
</style>
