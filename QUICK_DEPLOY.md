# Quick Railway Deployment

## 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

## 2. Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect Next.js and deploy

## 3. Get Your URL

After deployment (2-3 minutes), Railway will provide:
```
https://your-app-name.railway.app
```

## 4. Update WordPress

1. WordPress Admin → Settings → MicroFE
2. Set API URL: `https://your-app-name.railway.app`
3. Save

## 5. Test

```bash
curl https://your-app-name.railway.app/api/components
```

## ⚠️ Important: Storage

Railway's filesystem is **ephemeral** - uploaded components will be lost on redeploy.

**For production, you need:**
- Railway Volumes (mount `/components`, `/cdn`, `/uploads`)
- OR external storage (S3, R2, etc.)

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for details.

## That's It!

Your MicroFE API is now live on Railway! 🚀

