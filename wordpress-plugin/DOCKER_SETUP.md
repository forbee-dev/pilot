# Docker Setup for WordPress Plugin

## Problem

When WordPress runs in Docker, it can't access `localhost:3000` on your host machine because `localhost` inside the container refers to the container itself, not your host.

## Solutions

### Option 1: Use `host.docker.internal` (Mac/Windows Docker Desktop)

This is the easiest solution if you're using Docker Desktop on Mac or Windows.

1. Go to WordPress Admin → Settings → MicroFE
2. Set API URL to: `http://host.docker.internal:3000`
3. Save

### Option 2: Use Host Machine IP (Linux or if host.docker.internal doesn't work)

1. Find your host machine's IP address:
   ```bash
   # On Mac/Linux
   ipconfig getifaddr en0  # Mac
   hostname -I | awk '{print $1}'  # Linux
   
   # Or check your network settings
   ```

2. In WordPress Settings → MicroFE, use: `http://YOUR_HOST_IP:3000`
   Example: `http://192.168.1.100:3000`

### Option 3: Use Docker Bridge Gateway IP (Linux)

On Linux, Docker creates a bridge network with gateway `172.17.0.1`:

1. In WordPress Settings → MicroFE, use: `http://172.17.0.1:3000`
2. Save

### Option 4: Connect to Host Network (Linux only)

If you're on Linux, you can run WordPress container with `--network host`:

```bash
docker run --network host your-wordpress-image
```

Then use `http://localhost:3000` in WordPress settings.

### Option 5: Use Docker Compose with Extra Hosts

If using docker-compose, add to your WordPress service:

```yaml
services:
  wordpress:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Then use `http://host.docker.internal:3000` in WordPress settings.

## Testing

After setting the API URL:

1. Open browser console in WordPress editor (F12)
2. Look for: "Fetching components from: http://..."
3. Check for any CORS or network errors
4. Components should load in the dropdown

## Troubleshooting

### Still getting "Failed to fetch"?

1. **Check MicroFE is running on host:**
   ```bash
   curl http://localhost:3000/api/components
   ```

2. **Test from inside WordPress container:**
   ```bash
   docker exec -it your-wordpress-container curl http://host.docker.internal:3000/api/components
   # Or with your host IP
   docker exec -it your-wordpress-container curl http://YOUR_HOST_IP:3000/api/components
   ```

3. **Check firewall:** Make sure port 3000 is accessible

4. **Check CORS:** Make sure MicroFE API has CORS enabled (already configured in next.config.js)

### Finding Your Host IP

**Mac:**
```bash
ipconfig getifaddr en0
```

**Linux:**
```bash
hostname -I | awk '{print $1}'
# Or
ip route show default | awk '/default/ {print $3}'
```

**Windows:**
```cmd
ipconfig
# Look for IPv4 Address under your active network adapter
```

## Recommended Setup

For development on Mac/Windows with Docker Desktop:
- Use `http://host.docker.internal:3000` in WordPress settings

For production or Linux:
- Use your actual host IP address
- Or set up proper networking between containers


