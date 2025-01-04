import * as m from '$lib/paraglide/messages.js';

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

export function formatTime(timeString: string) {
    const date = new Date(`1970-01-01T${timeString}Z`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + m.o_clock({})
}