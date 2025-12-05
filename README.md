# Toxic Ex-Translator (前任誠實翻譯機)

> 不要相信鬼話。用 AI 翻譯前任那些模稜兩可的訊息，看穿背後有多缺德。

## Architecture

**Frontend:** Cloudflare Pages (Vite + React + TypeScript)  
**API:** Cloudflare Worker (`extranslator-worker`)  
**LLM:** xAI Grok API  

## Project Structure

```
ex-translate/
├── worker/                 # Cloudflare Worker
│   ├── src/
│   │   └── index.ts       # Worker API endpoint
│   ├── package.json
│   ├── wrangler.toml      # Worker configuration
│   └── tsconfig.json
├── components/            # React components
├── services/              # API service layer
├── App.tsx                # Main app component
├── index.html            # Entry HTML
├── package.json          # Frontend dependencies
└── vite.config.ts        # Vite build configuration
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- xAI Grok API key

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Worker:**
```bash
cd worker
npm install
cd ..
```

### 2. Configure Environment

#### Frontend
Create `.env` (optional, for local development):
```bash
# Use local worker URL if testing locally
VITE_WORKER_URL=http://localhost:8787
```

If not set, defaults to production: `https://extranslator-worker.samolab.workers.dev`

#### Worker
Set the Grok API key as a secret:
```bash
cd worker
npx wrangler secret put GROK_API_KEY
# Enter your Grok API key when prompted
```

### 3. Local Development

**Start Worker (Terminal 1):**
```bash
cd worker
npm run dev
# Worker runs at http://localhost:8787
```

**Start Frontend (Terminal 2):**
```bash
npm run dev
# Frontend runs at http://localhost:3000
```

## Deployment

### Step 1: Deploy Cloudflare Worker

```bash
cd worker
npm run deploy
```

This will deploy to: `https://extranslator-worker.samolab.workers.dev`

**Set the API key (if not already set):**
```bash
npx wrangler secret put GROK_API_KEY
```

### Step 2: Build Frontend

```bash
npm run build
```

This creates a production build in the `dist/` directory.

### Step 3: Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI
```bash
npx wrangler pages deploy dist --project-name=ex-translate
```

#### Option B: Using Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Connect your Git repository or upload `dist/` folder directly
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Add environment variable (if needed):
   - `VITE_WORKER_URL=https://extranslator-worker.samolab.workers.dev`
7. Deploy!

### Step 4: Configure Custom Domain (Optional)

In Cloudflare Pages settings, add your custom domain if desired.

## API Endpoint

### POST /api/translate

**Request:**
```json
{
  "message": "我們還是當朋友吧",
  "context": "朋友卡",
  "sender": "前男友"
}
```

**Response:**
```json{
  "true_meaning": "看到你就想吐，但不想把話說死。留著你當備胎，哪天沒人幹還能找你湊合。",
  "toxicity_level": 95
}
```

## Testing

### Test Worker Endpoint
```bash
curl -X POST https://extranslator-worker.samolab.workers.dev/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "哈哈哈",
    "context": "已讀不回/消失",
    "sender": "極品渣男/渣女"
  }'
```

### Test Frontend
Open the deployed Pages URL in a browser and test the translation functionality.

## Troubleshooting

### Worker Issues
- **Check logs:** `cd worker && npx wrangler tail`
- **Verify API key:** Make sure `GROK_API_KEY` secret is set
- **CORS errors:** Check that CORS headers are present in worker response

### Frontend Issues
- **API not connecting:** Verify `VITE_WORKER_URL` is correct
- **Build errors:** Run `npm install` to ensure all dependencies are installed
- **TypeScript errors:** TypeScript errors won't prevent build in production mode

## License

© 2025 Toxic Translator. Powered by Grok.

---

**注意：本服務極度毒舌，玻璃心請勿使用。**
