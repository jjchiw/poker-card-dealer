import { Language } from './translations';

/**
 * Audio service for playing card announcement sounds
 */
class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 1.0;
  private readonly STORAGE_KEY = 'poker-dealer-audio-enabled';

  constructor() {
    // Load saved preference
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  /**
   * Preload audio files for faster playback
   */
  public preloadCommonCards(language: Language = 'en'): void {
    const commonCards = [
      'A_spades',
      'A_hearts',
      'A_diamonds',
      'A_clubs',
      'K_spades',
      'K_hearts',
      'K_diamonds',
      'K_clubs',
      'Q_spades',
      'Q_hearts',
      'Q_diamonds',
      'Q_clubs',
      'J_spades',
      'J_hearts',
      'J_diamonds',
      'J_clubs',
    ];

    commonCards.forEach((cardId) => {
      this.getAudio(cardId, language);
    });
  }

  /**
   * Get or create an audio element for a card
   */
  private getAudio(cardId: string, language: Language): HTMLAudioElement {
    const cacheKey = `${language}_${cardId}`;

    if (!this.audioCache.has(cacheKey)) {
      const audio = new Audio(`/audio/${language}_${cardId}.mp3`);
      audio.volume = this.volume;
      this.audioCache.set(cacheKey, audio);
    }

    return this.audioCache.get(cacheKey)!;
  }

  /**
   * Play card announcement
   */
  public playCard(
    rank: string,
    suit: string,
    language: Language = 'en',
  ): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve();
    }

    const cardId = `${rank}_${suit}`;
    const audio = this.getAudio(cardId, language);

    return new Promise((resolve) => {
      // Stop any currently playing audio from this element
      audio.pause();
      audio.currentTime = 0;

      // Set up event listeners
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        resolve();
      };

      const onError = (e: Event) => {
        console.warn(`Failed to play audio for ${cardId}:`, e);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        resolve();
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      // Play the audio
      audio.play().catch((error) => {
        console.warn(`Audio play failed for ${cardId}:`, error);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        resolve();
      });
    });
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  /**
   * Enable or disable audio
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem(this.STORAGE_KEY, String(enabled));
  }

  /**
   * Check if audio is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clear audio cache
   */
  public clearCache(): void {
    this.audioCache.clear();
  }
}

// Export singleton instance
export const audioService = new AudioService();
