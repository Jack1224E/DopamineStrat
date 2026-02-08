import { Howl } from 'howler';

// Pre-create sound effects using data URIs for immediate availability
// These are simple synthesized sounds that work without external files

let successSound: Howl | null = null;

/**
 * Initialize sounds lazily to avoid SSR issues
 */
function getSuccessSound(): Howl {
    if (!successSound) {
        // Use a simple beep sound via data URI (base64 encoded WAV)
        // This is a short "ding" sound
        successSound = new Howl({
            src: ['data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU5v'],
            volume: 0.5,
            html5: true,
        });
    }
    return successSound;
}

/**
 * Play success sound if enabled
 */
export function playSuccessSound(enabled: boolean): void {
    if (enabled && typeof window !== 'undefined') {
        try {
            // Use Web Audio API for a quick success tone
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 880; // A5 note
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch {
            // Fallback to Howler if Web Audio fails
            getSuccessSound().play();
        }
    }
}
