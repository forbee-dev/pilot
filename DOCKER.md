# Docker Setup (Optional)

For easier deployment, you can containerize the MicroFE application.

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  microfe:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./components:/app/components
      - ./cdn:/app/cdn
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
```

## Usage

```bash
docker-compose up -d
```


