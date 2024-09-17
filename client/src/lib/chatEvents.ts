export const OPEN_CHAT_EVENT = 'openChat';

export const emitOpenChatEvent = (email: string) => {
    console.log("Emitting open chat event for:", email);
    if (typeof window !== 'undefined') {
        const event = new CustomEvent(OPEN_CHAT_EVENT, { detail: email });
        window.dispatchEvent(event);
    } else {
        console.warn("Window is not defined, cannot emit event");
    }
};
