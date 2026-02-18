# Audio Generation Scripts

This directory contains scripts for generating TTS audio files for poker cards.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your API credentials:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your credentials (see options below).

## Option 1: Azure Speech Services (Recommended - Cheapest)

### Create Azure Speech Service:

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Speech"** or **"Azure AI Speech"**
4. Click **"Create"** and fill in:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose closest to you (e.g., `eastus`, `westeurope`)
   - **Name**: Give it a name (e.g., `poker-tts`)
   - **Pricing tier**: Free (F0) or Standard (S0)
5. Click **"Review + Create"** then **"Create"**
6. Once deployed, go to **"Keys and Endpoint"**
7. Copy **KEY 1** and **LOCATION/REGION**

### Add to .env:
```
AZURE_SPEECH_KEY=your-key-from-step-7
AZURE_SPEECH_REGION=eastus
```

### Generate audio:
```bash
python generate_audio_azure.py
```

**Cost:** ~$0.01 for all 104 files (Neural voices are $16 per 1M characters)

## Option 2: OpenAI TTS

### Add to .env:
```
OPENAI_API_KEY=your-openai-api-key
```

### Generate audio:
```bash
python generate_audio.py
```

**Cost:** ~$0.01-0.02 for all 104 files

## Generate Audio Files

Run the script to generate all 104 audio files (52 cards × 2 languages):

```bash
python generate_audio.py
```

### What it generates:

- **English files**: `en_{rank}_{suit}.mp3`
  - Example: `en_A_spades.mp3` (says "A of Spades")
  
- **Spanish files**: `es_{rank}_{suit}.mp3`
  - Example: `es_A_picas.mp3` (says "As de Picas")

### Output location:

Files are saved to: `../public/audio/`

### Cost:

Approximately **$0.01 - $0.02** for all 104 files using OpenAI TTS.

### Voice options:

You can change the voice in the script by modifying `VOICE_EN` and `VOICE_ES`:
- `alloy` - Neutral
- `echo` - Male
- `fable` - British accent
- `onyx` - Deep male
- `nova` - Female (default)
- `shimmer` - Soft female

### Advanced options:

- Use `"tts-1-hd"` model for higher quality (costs 2x more)
- Adjust `speed` parameter (0.25 to 4.0)
- Re-run script safely - it skips existing files

## Alternative: Google Cloud TTS

If you prefer Google Cloud TTS, create a separate script or modify to use:
```python
from google.cloud import texttospeech
```

Cost: ~$4 per 1M characters (cheaper but requires GCP setup)
