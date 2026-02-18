#!/usr/bin/env python3
"""
Script to generate TTS audio files for poker cards using Azure Speech Services.

Prerequisites:
    pip install -r requirements.txt

Usage:
    1. Create Azure Speech Service in Azure Portal
    2. Add your Azure credentials to .env file
    3. Run: python generate_audio_azure.py

Output:
    Creates audio files in ../public/audio/ directory
    Format: {lang}_{rank}_{suit}.mp3
    Example: en_A_spades.mp3, es_A_picas.mp3
"""

import os
from pathlib import Path
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Azure credentials
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION")

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

# Voice options
# English voices: en-US-JennyNeural (female), en-US-GuyNeural (male), en-US-AriaNeural (female)
# Spanish voices: es-ES-ElviraNeural (female), es-MX-DaliaNeural (female), es-ES-AlvaroNeural (male)
VOICE_EN = 'en-US-JennyNeural'  # Natural female voice
VOICE_ES = 'es-ES-ElviraNeural'  # Natural Spanish female voice


def create_output_directory():
    """Create the output directory if it doesn't exist."""
    output_dir = Path(__file__).parent.parent / 'public' / 'audio'
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def generate_audio(text: str, output_path: Path, voice: str, language: str):
    """Generate audio file using Azure Speech Services."""
    try:
        # Configure speech synthesis
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        
        # Set the voice
        speech_config.speech_synthesis_voice_name = voice
        
        # Configure audio output
        audio_config = speechsdk.audio.AudioOutputConfig(filename=str(output_path))
        
        # Create synthesizer
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Generate speech
        result = synthesizer.speak_text_async(text).get()
        
        # Check result
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return True
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            print(f"Speech synthesis canceled: {cancellation.reason}")
            if cancellation.reason == speechsdk.CancellationReason.Error:
                print(f"Error details: {cancellation.error_details}")
            return False
        else:
            return False
            
    except Exception as e:
        print(f"Error generating {output_path.name}: {e}")
        return False


def main():
    """Generate all audio files."""
    output_dir = create_output_directory()
    
    total_files = len(RANKS) * len(SUITS_EN) * 2  # 52 cards × 2 languages
    generated = 0
    failed = 0
    
    print(f"Generating {total_files} audio files using Azure Speech Services...")
    print(f"Output directory: {output_dir}")
    print(f"Region: {AZURE_SPEECH_REGION}")
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
            if generate_audio(text, output_path, VOICE_EN, 'en-US'):
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
            if generate_audio(text, output_path, VOICE_ES, 'es-ES'):
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
    
    # Cost estimate (Azure pricing as of 2024)
    # Standard voices: $4 per 1M characters
    # Neural voices: $16 per 1M characters
    total_chars = sum(len(f"{r} of {s}") for r in RANKS for s in SUITS_EN.values()) * 2
    estimated_cost = (total_chars / 1_000_000) * 16  # Neural voices
    print(f"\n💰 Estimated cost: ${estimated_cost:.4f} (Neural voices)")


if __name__ == '__main__':
    # Check for required credentials
    if not AZURE_SPEECH_KEY:
        print("❌ Error: AZURE_SPEECH_KEY not found in .env file")
        print("\nPlease add your Azure Speech Service credentials to .env:")
        print("  AZURE_SPEECH_KEY=your-key-here")
        print("  AZURE_SPEECH_REGION=your-region-here")
        print("\nHow to get credentials:")
        print("  1. Go to https://portal.azure.com")
        print("  2. Create or select 'Azure AI Speech' service")
        print("  3. Go to 'Keys and Endpoint'")
        print("  4. Copy KEY 1 and LOCATION/REGION")
        exit(1)
    
    if not AZURE_SPEECH_REGION:
        print("❌ Error: AZURE_SPEECH_REGION not found in .env file")
        print("\nPlease add your Azure region to .env:")
        print("  AZURE_SPEECH_REGION=eastus")
        print("\nCommon regions: eastus, westus, westeurope, etc.")
        exit(1)
    
    main()
