import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { Card, CardDealerOptions, DealerEvent, Rank, Suit } from './types';

/**
 * CardDealer - A self-contained module for handling poker card dealing.
 * Focused on high-performance PixiJS rendering and GSAP animations.
 */
export class CardDealer {
  private app: PIXI.Application;
  private options: Required<CardDealerOptions>;
  private deck: Card[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private intervalMs: number = 1000;
  private timerId: number | null = null;
  private currentTween: gsap.core.Tween | null = null;
  private currentSprite: PIXI.Sprite | null = null;
  private eventHandlers: Map<string, Array<(data?: any) => void>> = new Map();

  private readonly RANKS: Rank[] = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];
  private readonly SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

  constructor(options: CardDealerOptions) {
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      assetRoot: options.assetRoot.endsWith('/')
        ? options.assetRoot
        : `${options.assetRoot}/`,
      autoShuffle: options.autoShuffle ?? true,
      repeat: options.repeat ?? false,
      deckCount: options.deckCount || 1,
    };

    this.app = new PIXI.Application({
      width: this.options.width,
      height: this.options.height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.initDeck();
    if (this.options.autoShuffle) {
      this.shuffle();
    }
  }

  public mount(parent: HTMLElement): void {
    if (this.app.view) {
      parent.appendChild(this.app.view as HTMLCanvasElement);
    }
  }

  public resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.app.renderer.resize(width, height);
    if (this.currentSprite) {
      this.currentSprite.x = width / 2;
      this.currentSprite.y = height / 2;
      this.updateCardScale(this.currentSprite);
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
            uniqueId: `${rank}_${suit}_d${d}`,
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
    // Stop any ongoing dealing
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.currentTween) {
      this.currentTween.kill();
      this.currentTween = null;
    }

    // Clear the canvas
    this.clearStage();

    // Shuffle the deck
    const array = new Uint32Array(this.deck.length);
    window.crypto.getRandomValues(array);
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = array[i] % (i + 1);
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.currentIndex = 0;
    this.emit('shuffle');
  }

  public async start(): Promise<void> {
    if (this.isPlaying) return;
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

  public dealOne(): void {
    if (this.currentIndex >= this.deck.length) {
      this.emit('complete');
      return;
    }
    this.dealNext();
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
    this.eventHandlers.clear();
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
    this.emit('deal', {
      card,
      index: this.currentIndex,
      total: this.deck.length,
    });
    if (this.isPlaying) this.scheduleNextDeal();
  }

  private clearStage(): void {
    if (this.currentSprite) {
      this.app.stage.removeChild(this.currentSprite);
      this.currentSprite.destroy();
      this.currentSprite = null;
    }
  }

  private updateCardScale(sprite: PIXI.Sprite): void {
    // Increased scale: card now occupies up to 85% of width or 90% of height for better visibility
    const targetScale = Math.min(
      (this.options.width * 0.85) / sprite.width,
      (this.options.height * 0.9) / sprite.height,
      2.0,
    );
    sprite.scale.set(targetScale);
  }

  private async animateCard(card: Card): Promise<void> {
    this.clearStage();
    const imageUrl = `${this.options.assetRoot}images/${card.id}.png`;
    let texture: PIXI.Texture;
    // try {
    //   texture = await PIXI.Assets.load(imageUrl);
    // } catch (e) {
    texture = this.createFallbackTexture(card);
    // }

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = this.options.width / 2;
    sprite.y = -200; // Start off-screen
    this.updateCardScale(sprite);
    sprite.alpha = 0;

    this.app.stage.addChild(sprite);
    this.currentSprite = sprite;

    return new Promise((resolve) => {
      this.currentTween = gsap.to(sprite, {
        y: this.options.height / 2,
        alpha: 1,
        duration: 0.4,
        ease: 'back.out(1.2)',
        onComplete: () => {
          this.currentTween = null;
          resolve();
        },
      });
    });
  }

  private createFallbackTexture(card: Card): PIXI.Texture {
    const graphic = new PIXI.Graphics();
    // Bigger fallback dimensions
    const w = 240;
    const h = 340;
    graphic.beginFill(0xffffff);
    graphic.lineStyle(4, 0x000000);
    graphic.drawRoundedRect(0, 0, w, h, 20);
    graphic.endFill();
    const color =
      card.suit === 'hearts' || card.suit === 'diamonds' ? 0xff0000 : 0x000000;
    const suitSymbol = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[
      card.suit
    ];
    const text = new PIXI.Text(`${card.rank}\n${suitSymbol}`, {
      fontSize: 80,
      fill: color,
      align: 'center',
      fontWeight: 'bold',
    });
    text.anchor.set(0.5);
    text.x = w / 2;
    text.y = h / 2;
    graphic.addChild(text);
    return this.app.renderer.generateTexture(graphic);
  }
}
