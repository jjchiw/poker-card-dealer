
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GoogleGenAI, Modality } from "@google/genai";
import { Card, CardDealerOptions, DealerEvent, Rank, Suit } from './types';

const DB_NAME = 'PokerDealerAudioCache';
const STORE_NAME = 'audio_cache';

/**
 * CardDealer - A self-contained module for handling poker card dealing.
 * Features persistent IndexedDB caching and multi-deck support.
 */
export class CardDealer {
  private app: PIXI.Application;
  private options: Required<CardDealerOptions> & { language: 'en' | 'es' };
  private deck: Card[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private intervalMs: number = 1000;
  private timerId: number | null = null;
  private currentTween: gsap.core.Tween | null = null;
  private currentSprite: PIXI.Sprite | null = null;
  private eventHandlers: Map<string, Array<(data?: any) => void>> = new Map();
  private audioCache: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext;
  private db: IDBDatabase | null = null;

  private readonly RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  private readonly SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

  constructor(options: CardDealerOptions & { language?: 'en' | 'es' }) {
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      assetRoot: options.assetRoot.endsWith('/') ? options.assetRoot : `${options.assetRoot}/`,
      autoShuffle: options.autoShuffle ?? true,
      repeat: options.repeat ?? false,
      deckCount: options.deckCount || 1,
      language: options.language || 'en',
    };

    this.app = new PIXI.Application({
      width: this.options.width,
      height: this.options.height,
      backgroundAlpha: 0,
      antialias: true,
    });

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    this.initDB().then(() => {
      this.initDeck();
      if (this.options.autoShuffle) {
        this.shuffle();
      }
    });
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = () => resolve(); 
    });
  }

  private async getCachedAudio(key: string): Promise<AudioBuffer | null> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = async () => {
        if (request.result) {
          try {
            const buffer = await this.decodeRawPCM(new Uint8Array(request.result), this.audioContext, 24000, 1);
            resolve(buffer);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  private async saveAudioToCache(key: string, data: Uint8Array): Promise<void> {
    if (!this.db) return;
    try {
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(data.buffer, key);
    } catch (e) {
      console.warn('Failed to save to IDB:', e);
    }
  }

  public mount(parent: HTMLElement): void {
    if (this.app.view) {
      parent.appendChild(this.app.view as HTMLCanvasElement);
    }
  }

  private initDeck(): void {
    this.deck = [];
    for (let d = 0; d < this.options.deckCount; d++) {
      for (const suit of this.SUITS) {
        for (const rank of this.RANKS) {
          this.deck.push({ 
            rank, 
            suit, 
            id: `${rank}_${suit}`,
            uniqueId: `${rank}_${suit}_d${d}`
          });
        }
      }
    }
    this.currentIndex = 0;
  }

  public setDeckCount(count: number): void {
    this.options.deckCount = Math.max(1, count);
    this.pause();
    this.initDeck();
    this.shuffle();
  }

  public async shuffle(): Promise<void> {
    const array = new Uint32Array(this.deck.length);
    window.crypto.getRandomValues(array);
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = array[i] % (i + 1);
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.currentIndex = 0;
    this.emit('shuffle');
    if (this.deck.length > 0) this.precacheCard(this.deck[0]);
  }

  public async start(): Promise<void> {
    if (this.isPlaying) return;
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();
    this.isPlaying = true;
    this.emit('resume');
    this.scheduleNextDeal();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
    if (this.currentTween) this.currentTween.pause();
    this.emit('pause');
  }

  public resume(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.currentTween && this.currentTween.paused()) {
      this.currentTween.resume();
    } else {
      this.scheduleNextDeal();
    }
    this.emit('resume');
  }

  public setLanguage(lang: 'en' | 'es'): void {
    this.options.language = lang;
    if (this.currentIndex < this.deck.length) {
      this.precacheCard(this.deck[this.currentIndex]);
    }
  }

  public rewind(steps: number = 1): void {
    this.pause();
    const targetIndex = this.currentIndex - (steps + 1);
    if (targetIndex < -1) {
      this.currentIndex = 0;
      this.clearStage();
      this.emit('rewind-finished');
    } else {
      this.currentIndex = Math.max(0, targetIndex);
      this.dealNext();
    }
  }

  public setInterval(ms: number): void {
    this.intervalMs = Math.max(100, ms);
  }

  public on(event: DealerEvent, handler: (data?: any) => void): void {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event)?.push(handler);
  }

  public destroy(): void {
    this.pause();
    this.app.destroy(true, { children: true, texture: true });
    this.audioContext.close();
    this.eventHandlers.clear();
    this.audioCache.clear();
  }

  private emit(event: string, data?: any): void {
    this.eventHandlers.get(event)?.forEach((h) => h(data));
  }

  private scheduleNextDeal(): void {
    if (!this.isPlaying) return;
    this.timerId = window.setTimeout(() => this.dealNext(), this.intervalMs);
  }

  private async dealNext(): Promise<void> {
    if (this.currentIndex >= this.deck.length) {
      this.emit('complete');
      if (this.options.repeat) {
        await this.shuffle();
        this.scheduleNextDeal();
      } else {
        this.isPlaying = false;
      }
      return;
    }
    const card = this.deck[this.currentIndex];
    this.currentIndex++;

    await this.animateCard(card);
    if (this.currentIndex < this.deck.length) this.precacheCard(this.deck[this.currentIndex]);
    this.emit('deal', { card, index: this.currentIndex, total: this.deck.length });
    if (this.isPlaying) this.scheduleNextDeal();
  }

  private clearStage(): void {
    if (this.currentSprite) {
      this.app.stage.removeChild(this.currentSprite);
      this.currentSprite.destroy();
      this.currentSprite = null;
    }
  }

  private async animateCard(card: Card): Promise<void> {
    this.clearStage();
    const imageUrl = `${this.options.assetRoot}images/${card.id}.png`;
    let texture: PIXI.Texture;
    try {
      texture = await PIXI.Assets.load(imageUrl);
    } catch (e) {
      texture = this.createFallbackTexture(card);
    }

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = 0;
    sprite.y = 0;
    const targetScale = Math.min((this.options.width * 0.4) / sprite.width, (this.options.height * 0.6) / sprite.height, 1);
    sprite.scale.set(targetScale * 0.5);
    sprite.alpha = 0;

    this.app.stage.addChild(sprite);
    this.currentSprite = sprite;

    // Speak card (non-blocking)
    this.speakCard(card).catch(console.error);

    return new Promise((resolve) => {
      this.currentTween = gsap.to(sprite, {
        x: this.options.width / 2,
        y: this.options.height / 2,
        alpha: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          this.currentTween = null;
          resolve();
        },
      });
    });
  }

  private async precacheCard(card: Card): Promise<void> {
    const lang = this.options.language;
    const cacheKey = `${card.id}_${lang}`;
    if (this.audioCache.has(cacheKey)) return;

    const dbBuffer = await this.getCachedAudio(cacheKey);
    if (dbBuffer) {
      this.audioCache.set(cacheKey, dbBuffer);
      return;
    }

    try {
      const text = this.getCardName(card, lang);
      const result = await this.generateTTS(text, lang);
      if (result) {
        this.audioCache.set(cacheKey, result.buffer);
        this.saveAudioToCache(cacheKey, result.bytes);
      }
    } catch (e) {
      // Quota failure or other error - just ignore for precache
    }
  }

  private async speakCard(card: Card): Promise<void> {
    const lang = this.options.language;
    const cacheKey = `${card.id}_${lang}`;
    let buffer = this.audioCache.get(cacheKey);

    if (!buffer) {
      buffer = await this.getCachedAudio(cacheKey) || undefined;
      if (!buffer) {
        try {
          const text = this.getCardName(card, lang);
          const result = await this.generateTTS(text, lang);
          if (result) {
            buffer = result.buffer;
            this.audioCache.set(cacheKey, buffer);
            this.saveAudioToCache(cacheKey, result.bytes);
          }
        } catch (e) {
          console.warn('TTS silent skip due to error (likely quota):', e);
          return;
        }
      } else {
        this.audioCache.set(cacheKey, buffer);
      }
    }

    if (buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    }
  }

  private getCardName(card: Card, lang: 'en' | 'es'): string {
    const rankMap: Record<Rank, { en: string; es: string }> = {
      'A': { en: 'Ace', es: 'As' }, '2': { en: 'Two', es: 'Dos' }, '3': { en: 'Three', es: 'Tres' },
      '4': { en: 'Four', es: 'Cuatro' }, '5': { en: 'Five', es: 'Cinco' }, '6': { en: 'Six', es: 'Seis' },
      '7': { en: 'Seven', es: 'Siete' }, '8': { en: 'Eight', es: 'Ocho' }, '9': { en: 'Nine', es: 'Nueve' },
      '10': { en: 'Ten', es: 'Diez' }, 'J': { en: 'Jack', es: 'Sota' }, 'Q': { en: 'Queen', es: 'Reina' },
      'K': { en: 'King', es: 'Rey' }
    };
    const suitMap: Record<Suit, { en: string; es: string }> = {
      'spades': { en: 'Spades', es: 'Picas' }, 'hearts': { en: 'Hearts', es: 'Corazones' },
      'diamonds': { en: 'Diamonds', es: 'Diamantes' }, 'clubs': { en: 'Clubs', es: 'Tréboles' }
    };
    return lang === 'es' ? `${rankMap[card.rank].es} de ${suitMap[card.suit].es}` : `${rankMap[card.rank].en} of ${suitMap[card.suit].en}`;
  }

  private async generateTTS(text: string, lang: 'en' | 'es'): Promise<{ bytes: Uint8Array, buffer: AudioBuffer } | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = lang === 'es' ? `Diga claramente en español: ${text}` : `Speak clearly in English: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content.parts.find(p => p.inlineData && p.inlineData.data);
      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) return null;

      const bytes = this.decodeBase64(base64Audio);
      const buffer = await this.decodeRawPCM(bytes, this.audioContext, 24000, 1);
      return { bytes, buffer };
    } catch (e) {
      return null; // Graceful failure for quota
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  private async decodeRawPCM(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }

  private createFallbackTexture(card: Card): PIXI.Texture {
    const graphic = new PIXI.Graphics();
    graphic.beginFill(0xffffff);
    graphic.lineStyle(2, 0x000000);
    graphic.drawRoundedRect(0, 0, 140, 200, 10);
    graphic.endFill();
    const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? 0xff0000 : 0x000000;
    const suitSymbol = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[card.suit];
    const text = new PIXI.Text(`${card.rank}\n${suitSymbol}`, { fontSize: 48, fill: color, align: 'center' });
    text.anchor.set(0.5); text.x = 70; text.y = 100;
    graphic.addChild(text);
    return this.app.renderer.generateTexture(graphic);
  }
}
