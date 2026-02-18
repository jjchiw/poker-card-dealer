#!/usr/bin/env python3
"""
Script to generate TTS audio files for poker cards in English and Spanish.

Prerequisites:
    pip install -r requirements.txt

Usage:
    1. Copy .env.example to .env
    2. Add your OpenAI API key to .env
    3. Run: python generate_audio.py

Output:
    Creates audio files in ../public/audio/ directory
    Format: {lang}_{rank}_{suit}.mp3
    Example: en_A_spades.mp3, es_A_picas.mp3
"""

import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Card definitions
RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

# English suits and translations
SUITS_EN = {
    'spades': 'Spades',
    'hearts': 'Hearts',
    'diamonds': 'Diamonds',
    'clubs': 'Clubs'
}

# Spanish suits
SUITS_ES = {
    'spades': 'Picas',
    'hearts': 'Corazones',
    'diamonds': 'Diamantes',
    'clubs': 'Tréboles'
}

# Spanish rank translations
RANKS_ES = {
    'A': 'As',
    '2': 'Dos',
    '3': 'Tres',
    '4': 'Cuatro',
    '5': 'Cinco',
    '6': 'Seis',
    '7': 'Siete',
    '8': 'Ocho',
    '9': 'Nueve',
    '10': 'Diez',
    'J': 'Jota',
    'Q': 'Reina',
    'K': 'Rey'
}

# Voice options: alloy, echo, fable, onyx, nova, shimmer
VOICE_EN = 'nova'  # Female voice, good for English
VOICE_ES = 'nova'  # Same voice works well for Spanish too


def create_output_directory():
    """Create the output directory if it doesn't exist."""
    output_dir = Path(__file__).parent.parent / 'public' / 'audio'
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def generate_audio(text: str, output_path: Path, voice: str = 'nova'):
    """Generate audio file using OpenAI TTS API."""
    try:
        response = client.audio.speech.create(
            model="tts-1",  # or "tts-1-hd" for higher quality
            voice=voice,
            input=text,
            speed=1.0
        )
        
        # Save the audio file
        response.stream_to_file(output_path)
        return True
    except Exception as e:
        print(f"Error generating {output_path.name}: {e}")
        return False


def main():
    """Generate all audio files."""
    output_dir = create_output_directory()
    
    total_files = len(RANKS) * len(SUITS_EN) * 2  # 52 cards × 2 languages
    generated = 0
    failed = 0
    
    print(f"Generating {total_files} audio files...")
    print(f"Output directory: {output_dir}")
    print("-" * 60)
    
    # Generate English audio files
    print("\n📢 Generating English audio files...")
    for suit_key, suit_name in SUITS_EN.items():
        for rank in RANKS:
            text = f"{rank} of {suit_name}"
            filename = f"en_{rank}_{suit_key}.mp3"
            output_path = output_dir / filename
            
            if output_path.exists():
                print(f"⏭️  Skipping {filename} (already exists)")
                generated += 1
                continue
            
            print(f"🎤 Generating: {filename} - '{text}'")
            if generate_audio(text, output_path, VOICE_EN):
                generated += 1
                print(f"✅ Created: {filename}")
            else:
                failed += 1
    
    # Generate Spanish audio files
    print("\n📢 Generando archivos de audio en español...")
    for suit_key, suit_name in SUITS_ES.items():
        for rank in RANKS:
            rank_es = RANKS_ES[rank]
            text = f"{rank_es} de {suit_name}"
            filename = f"es_{rank}_{suit_key}.mp3"
            output_path = output_dir / filename
            
            if output_path.exists():
                print(f"⏭️  Omitiendo {filename} (ya existe)")
                generated += 1
                continue
            
            print(f"🎤 Generando: {filename} - '{text}'")
            if generate_audio(text, output_path, VOICE_ES):
                generated += 1
                print(f"✅ Creado: {filename}")
            else:
                failed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"✨ Generation complete!")
    print(f"✅ Successfully generated: {generated}/{total_files}")
    if failed > 0:
        print(f"❌ Failed: {failed}")
    print(f"📁 Files saved to: {output_dir}")
    print("=" * 60)
    
    # Cost estimate
    total_chars = sum(len(f"{r} of {s}") for r in RANKS for s in SUITS_EN.values()) * 2
    estimated_cost = (total_chars / 1_000_000) * 15  # $15 per 1M characters
    print(f"\n💰 Estimated cost: ${estimated_cost:.4f}")


if __name__ == '__main__':
    # Check for API key
    if not os.environ.get("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found")
        print("\nPlease create a .env file with your API key:")
        print("  1. Copy .env.example to .env")
        print("  2. Add your OpenAI API key to the .env file")
        print("\nOr set it directly:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        exit(1)
    
    main()
