// Keep existing English/digit tags, and resolve other layouts by physical key.
export function getKeyboardTag(event) {
    if (event.key.length === 1 && /^[a-zA-Z0-9]$/.test(event.key)) {
        return event.key;
    }
    if (/^Key[A-Z]$/.test(event.code)) {
        const letter = event.code.slice(3);
        return event.shiftKey ? letter : letter.toLowerCase();
    }
    return null;
}
