# Deployment Checklist

## ✅ Pre-Deployment

- [x] Railway configuration files created
- [x] Build scripts configured
- [x] CORS headers set up
- [ ] Code pushed to GitHub

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Push (now using HTTPS - will prompt for credentials)
git push -u origin main
# or if you're on 'init' branch:
git push -u origin init
```

**Note:** GitHub will prompt for:
- Username: your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Create at: https://github.com/settings/tokens
  - Select "repo" scope

### 2. Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access GitHub
5. Select repository: `forbee-dev/pilot`
6. Railway will auto-detect Next.js and start deploying

### 3. Wait for Deployment

- Build takes 2-5 minutes
- Watch logs in Railway dashboard
- You'll get a URL like: `https://pilot-production.up.railway.app`

### 4. Get Your Railway URL

After deployment completes:
- Railway dashboard → Your project → Settings → Domains
- Copy the generated URL

### 5. Update WordPress

1. WordPress Admin → Settings → MicroFE
2. Set API URL to your Railway URL
3. Save

### 6. Test

```bash
# Test API
curl https://your-railway-url.railway.app/api/components

# Should return your components (or empty array if none uploaded yet)
```

## 🔧 Troubleshooting

### GitHub Push Issues

**If HTTPS doesn't work:**
1. Use Personal Access Token instead of password
2. Or add SSH key to GitHub: https://github.com/settings/keys

### Railway Build Fails

- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Components Not Persisting

- Railway filesystem is ephemeral
- Use Railway Volumes for `/components`, `/cdn`, `/uploads`
- Or migrate to external storage (S3, etc.)

## 📝 Next Steps After Deployment

1. Upload a test component via the dashboard
2. Test in WordPress block editor
3. Set up Railway Volumes for persistent storage
4. Configure custom domain (optional)

