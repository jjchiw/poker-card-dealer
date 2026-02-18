# Azure Speech Service Setup Guide

## Step-by-Step Instructions

### 1. Go to Azure Portal
Visit: https://portal.azure.com and sign in

### 2. Create Speech Service

**Option A: Quick Create**
- In the search bar at the top, type: **"Speech"**
- Click on **"Speech Services"** (under Marketplace)
- Click **"Create"**

**Option B: From Services**
- Click **"Create a resource"** (+ icon)
- Under **"AI + Machine Learning"**, find **"Speech"**
- Click **"Create"**

### 3. Fill in the Details

**Basics tab:**
- **Subscription**: Select your Azure subscription
- **Resource group**: 
  - Click "Create new" if you don't have one
  - Name it something like `poker-dealer-rg`
- **Region**: Choose the closest to you:
  - US: `eastus`, `westus2`, `centralus`
  - Europe: `westeurope`, `northeurope`
  - Asia: `japaneast`, `southeastasia`
  - Latin America: `brazilsouth`
- **Name**: Enter a unique name (e.g., `poker-dealer-speech`)
- **Pricing tier**: 
  - **Free (F0)**: 5M characters/month free (enough for testing)
  - **Standard (S0)**: Pay-as-you-go

### 4. Create the Resource
- Click **"Review + create"**
- Review the settings
- Click **"Create"**
- Wait 1-2 minutes for deployment

### 5. Get Your Credentials

Once deployed:
1. Click **"Go to resource"**
2. In the left menu, click **"Keys and Endpoint"**
3. You'll see:
   - **KEY 1** (copy this)
   - **KEY 2** (backup key)
   - **Location/Region** (e.g., `eastus`)

### 6. Add to .env File

Open `scripts/.env` and add:
```
AZURE_SPEECH_KEY=your-key-1-here
AZURE_SPEECH_REGION=eastus
```

### 7. Run the Script

```bash
cd scripts
pip install -r requirements.txt
python generate_audio_azure.py
```

## Pricing

**Free Tier (F0):**
- 5 million characters per month
- Neural voices: 0.5M characters free
- Perfect for this project!

**Standard Tier (S0):**
- Neural voices: $16 per 1M characters
- Our 104 files ≈ ~$0.01

## Voices Used

- **English**: `en-US-JennyNeural` (natural female voice)
- **Spanish**: `es-ES-ElviraNeural` (natural Spanish female voice)

You can change these in `generate_audio_azure.py` if you prefer different voices.

## Troubleshooting

**"Invalid subscription key or region"**
- Double-check your KEY and REGION in .env
- Make sure there are no extra spaces

**"Access denied"**
- Make sure you copied KEY 1, not the endpoint URL
- Check that your Azure subscription is active

**"Region not recognized"**
- Region should be lowercase (e.g., `eastus`, not `East US`)
- Common regions: eastus, westus2, westeurope, southeastasia
