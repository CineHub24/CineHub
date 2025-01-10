import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import CinemasPage from './+page.svelte';
import { languageAwareGoto } from '$lib/utils/languageAware.js';

// Mock für languageAwareGoto
vi.mock('$lib/utils/languageAware.js', () => ({
languageAwareGoto: vi.fn()
}));

test('CinemasPage renders correctly and handles interactions', async () => {
const mockCinemas = [
{ id: 1, name: 'Cinema 1', address: 'Address 1', opentime: '10:00', closeTime: '22:00', numScreens: 3 },
{ id: 2, name: 'Cinema 2', address: 'Address 2', opentime: '09:00', closeTime: '23:00', numScreens: 5 },
];

render(CinemasPage, {
props: {
data: {
    cinemas: mockCinemas,
    user: undefined
}
}
});

// Überprüfen, ob die Überschrift korrekt gerendert wird
expect(screen.getByText('Kino-Verwaltung')).toBeTruthy();

// Überprüfen, ob der "Neues Kino" Button vorhanden ist
const newCinemaButton = screen.getByText('Neues Kino');
expect(newCinemaButton).toBeTruthy();

// Überprüfen, ob die Tabelle korrekt gerendert wird
expect(screen.getByText('Name')).toBeTruthy();
expect(screen.getByText('Adresse')).toBeTruthy();
expect(screen.getByText('Öffnet um')).toBeTruthy();
expect(screen.getByText('Schließt um')).toBeTruthy();
expect(screen.getByText('Aktionen')).toBeTruthy();

// Überprüfen, ob die Kino-Daten korrekt angezeigt werden
mockCinemas.forEach(cinema => {
expect(screen.getByText(cinema.name)).toBeTruthy();
expect(screen.getByText(cinema.address)).toBeTruthy();
expect(screen.getByText(cinema.opentime)).toBeTruthy();
expect(screen.getByText(cinema.closeTime)).toBeTruthy();
});

// Überprüfen der "Neues Kino" Button-Funktionalität
await newCinemaButton.click();
expect(languageAwareGoto).toHaveBeenCalledWith('/admin/cinemas/create');

// Überprüfen der "Bearbeiten" Button-Funktionalität
const editButtons = screen.getAllByText('Bearbeiten');
await editButtons[0].click();
expect(languageAwareGoto).toHaveBeenCalledWith('/admin/cinemas/1');

// Überprüfen, ob "Löschen" Buttons vorhanden sind
const deleteButtons = screen.getAllByText('Löschen');
expect(deleteButtons.length).toBe(mockCinemas.length);

// Hier könnten Sie noch weitere Tests für das Löschen-Formular hinzufügen,
// wenn Sie die Formular-Submission testen möchten.
});