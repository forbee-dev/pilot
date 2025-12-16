# GitHub SSH Setup

## Quick Fix Options

### Option 1: Add SSH Key to GitHub (Recommended)

1. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub | pbcopy
   ```

2. **Add to GitHub:**
   - Go to https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key
   - Save

3. **Test connection:**
   ```bash
   ssh -T git@github.com
   ```
   Should say: "Hi username! You've successfully authenticated..."

### Option 2: Switch to HTTPS (Easier)

If you prefer not to use SSH:

```bash
cd /Users/tiago.santos/Pilot
git remote set-url origin https://github.com/forbee-dev/pilot.git
```

Then push with:
```bash
git push -u origin init
```
(GitHub will prompt for username/password or token)

### Option 3: Add Key to SSH Agent

If your key exists but isn't loaded:

```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add your key
ssh-add ~/.ssh/id_ed25519

# Test
ssh -T git@github.com
```

## After Setup

Once authenticated, push your code:

```bash
git add .
git commit -m "Ready for Railway deployment"
git push -u origin main
# or
git push -u origin init
```

