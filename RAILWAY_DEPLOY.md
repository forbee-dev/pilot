# Railway Deployment Guide

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. Railway CLI installed (optional, for local deployment)
3. Git repository (Railway can deploy from GitHub)

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Create a New Project:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or "Empty Project" to deploy manually)

2. **Connect Your Repository:**
   - If using GitHub: Select your repository
   - Railway will auto-detect it's a Next.js app

3. **Configure Build Settings:**
   - Railway will auto-detect Next.js
   - Build Command: `npm run build` (auto-detected)
   - Start Command: `npm start` (auto-detected)
   - Root Directory: `/` (or leave empty)

4. **Set Environment Variables:**
   - Railway will provide a `PORT` variable automatically
   - No additional env vars needed for basic setup
   - Next.js will use `PORT` environment variable

5. **Deploy:**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app.railway.app`

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Environment Variables

Railway automatically provides:
- `PORT` - Port to run the server on (Next.js uses this automatically)
- `NODE_ENV=production` - Set automatically

Optional variables you can set:
- `NEXT_PUBLIC_API_URL` - If you need to reference the API URL in client code

## Post-Deployment

### 1. Get Your Railway URL

After deployment, Railway provides a URL like:
```
https://your-app-name.railway.app
```

### 2. Update WordPress Settings

1. Go to WordPress Admin → Settings → MicroFE
2. Set API URL to your Railway URL: `https://your-app-name.railway.app`
3. Save

### 3. Test the API

```bash
curl https://your-app-name.railway.app/api/components
```

Should return your components list.

## Persistent Storage

**Important:** Railway's filesystem is ephemeral. Uploaded components will be lost on redeploy.

### Option 1: Use Railway Volumes (Recommended)

1. In Railway dashboard, go to your service
2. Click "New" → "Volume"
3. Mount it to `/components`, `/cdn`, and `/uploads`
4. Update the paths in your code or use environment variables

### Option 2: Use External Storage

For production, consider:
- **AWS S3** for component storage
- **Cloudflare R2** for CDN assets
- **PostgreSQL** for metadata (via Railway's PostgreSQL service)

## Custom Domain

1. In Railway dashboard, go to your service
2. Click "Settings" → "Networking"
3. Add your custom domain
4. Railway will provide DNS instructions

## Monitoring

Railway provides:
- Build logs
- Runtime logs
- Metrics (CPU, Memory, Network)
- Deploy history

Access via the Railway dashboard.

## Troubleshooting

### Build Fails

- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Railway auto-detects, but you can specify in `package.json`)

### Components Not Persisting

- Railway's filesystem is ephemeral
- Use Railway Volumes or external storage (S3, etc.)

### Port Issues

- Railway automatically sets `PORT` environment variable
- Next.js uses this automatically
- No configuration needed

### CORS Issues

- CORS is already configured in `next.config.js`
- Make sure your WordPress site URL is allowed (currently set to `*`)

## Production Recommendations

1. **Use Railway Volumes** for persistent storage
2. **Set up monitoring** via Railway dashboard
3. **Configure custom domain** for better branding
4. **Set up CI/CD** via GitHub integration
5. **Use environment variables** for sensitive data
6. **Enable Railway's auto-deploy** from main branch

## Cost

Railway offers:
- Free tier: $5 credit/month
- Pay-as-you-go pricing
- Check current pricing at https://railway.app/pricing

## Next Steps

After deployment:
1. Test the API endpoints
2. Update WordPress plugin with Railway URL
3. Upload a test component
4. Verify it works in WordPress

