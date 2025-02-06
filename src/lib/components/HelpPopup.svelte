<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    // Erzeuge einen Dispatcher, um z. B. ein "close"-Event an den Parent zu senden
    const dispatch = createEventDispatcher();
  
    // Sichtbarkeit des Popups (als Prop übergeben)
    export let visible: boolean = false;
    // Sprache als Prop (z. B. "de" oder "en") – standardmäßig "de"
    export let language: string = 'de';
  
    // Übersetzungsobjekt – hier kannst du weitere Sprachen hinzufügen
    const translations = {
      de: {
        title: "Hilfe & Anleitung",
        // Die Anleitung als HTML-String; du kannst den Inhalt nach Belieben anpassen
        content: `
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
            <li>Ein Popup zeigt alle wichtigen Informationen und Tipps in der gewählten Sprache an.</li>
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
        `,
        close: "Schließen"
      },
      en: {
        title: "Help & Instructions",
        content: `
          <h2>Table of Contents</h2>
          <ol>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#basic-usage">Basic Usage</a></li>
            <li><a href="#adding-seats">Adding Seats</a></li>
            <li><a href="#moving-and-aligning">Moving and Aligning Seats</a></li>
            <li><a href="#editing-seats">Editing Seat Positions</a></li>
            <li><a href="#assigning-rows">Assigning Rows and Numbering</a></li>
            <li><a href="#saving-layout">Saving the Layout</a></li>
            <li><a href="#help-function">Help Function</a></li>
            <li><a href="#shortcuts">Keyboard Shortcuts</a></li>
          </ol>
          
          <h3 id="overview">1. Overview</h3>
          <p>
            The seat plan editor allows you to visually design a room (e.g. a cinema hall). 
            You can add, move, align, duplicate, delete, and number seats via drag & drop. 
            All changes are saved, and you can undo recent modifications.
          </p>
          
          <h3 id="basic-usage">2. Basic Usage</h3>
          <h4>Create / Open a Layout</h4>
          <ul>
            <li><strong>Create New:</strong> When launching the editor, enter a room name and select a cinema hall.</li>
            <li><strong>Load Layout:</strong> Existing layouts are loaded, displaying all placed seats.</li>
          </ul>
          <h4>Workspace</h4>
          <ul>
            <li><strong>Top Bar:</strong> Contains input fields (room name, cinema hall) and a list of seat categories.</li>
            <li><strong>Main Area:</strong> This is where you design your layout and see all the seat blocks.</li>
          </ul>
          
          <h3 id="adding-seats">3. Adding Seats</h3>
          <ul>
            <li><strong>Select Category:</strong> Choose a seat type from the category list.</li>
            <li><strong>Drag & Drop:</strong> Drag the selected icon onto the workspace. The seat will be placed at the pointer location.</li>
          </ul>
          
          <h3 id="moving-and-aligning">4. Moving and Aligning Seats</h3>
          <h4>Drag & Drop</h4>
          <ul>
            <li><strong>Moving a Single Seat:</strong> Click on a seat, hold the mouse button, and drag it to the desired position.</li>
            <li><strong>Multiple Selection:</strong> Hold Ctrl (or Cmd) to select multiple seats.</li>
          </ul>
          <h4>Snap Function and Guidelines</h4>
          <ul>
            <li>Seats will "snap" to nearby alignment or pattern points while being moved.</li>
            <li>Guidelines (vertical and horizontal) help with precise alignment.</li>
            <li>Holding the Shift key temporarily disables the snapping.</li>
          </ul>
          <h4>Multiple Selection Box</h4>
          <ul>
            <li>Drag a selection box in an empty area of the workspace to select multiple seats.</li>
          </ul>
          
          <h3 id="editing-seats">5. Editing Seat Positions</h3>
          <h4>Duplicate</h4>
          <ul>
            <li>Select one or more seats and click "Duplicate". The seats will be copied and slightly offset.</li>
          </ul>
          <h4>Delete</h4>
          <ul>
            <li>Select the seat(s) to be deleted and click "Delete" or press the Delete/Backspace key.</li>
          </ul>
          <h4>Undo</h4>
          <ul>
            <li>Press Ctrl+Z (Cmd+Z on Mac) to undo the last change.</li>
          </ul>
          
          <h3 id="assigning-rows">6. Assigning Rows and Numbering</h3>
          <ul>
            <li>Select the seats for a row and click "Assign Row".</li>
            <li>Enter a letter (A–Z). The seats will be numbered automatically from left to right.</li>
            <li>Seats missing a row or number will be marked as "Unassigned".</li>
          </ul>
          
          <h3 id="saving-layout">7. Saving the Layout</h3>
          <ul>
            <li>Click "Save Room" to store your layout.</li>
            <li>Before saving, the editor checks that the room name, cinema hall, and all seat assignments are valid.</li>
            <li>A confirmation message is shown upon successful saving.</li>
          </ul>
          
          <h3 id="help-function">8. Help Function</h3>
          <ul>
            <li>Open the help function by clicking the "Help" button (typically fixed at the bottom right).</li>
            <li>A popup displays all important instructions and tips in the selected language.</li>
          </ul>
          
          <h3 id="shortcuts">9. Keyboard Shortcuts</h3>
          <ul>
            <li><strong>Shift:</strong> Temporarily disables snapping.</li>
            <li><strong>Ctrl+Z / Cmd+Z:</strong> Undo the last action.</li>
            <li><strong>Ctrl+C / Cmd+C:</strong> Copy selected seats.</li>
            <li><strong>Ctrl+V / Cmd+V:</strong> Paste copied seats.</li>
            <li><strong>Delete / Backspace:</strong> Delete selected seats.</li>
            <li><strong>R:</strong> Rotate the selected seats by a fixed increment (e.g., 15°).</li>
          </ul>
          
          <p><strong>Good luck creating your seat plan!</strong></p>
        `,
        close: "Close"
      }
    };
  
    // Reaktive Variable für die aktuell genutzte Übersetzung
    $: t = translations[language] || translations.de;
  
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
        <h2 class="text-2xl font-bold mb-4">{t.title}</h2>
        <!-- Der Inhalt wird als HTML eingefügt -->
        <div class="prose" >
          {@html t.content}
        </div>
        <div class="mt-4 text-right">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            on:click={closePopup}
          >
            {t.close}
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
  