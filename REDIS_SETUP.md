# Redis Setup for Fixia - Rate Limiting & Caching

## Quick Start (Development)

### Option 1: Docker (Recommended)

```bash
# Start Redis with Docker Compose
docker-compose -f docker-compose.dev.yml up -d redis

# Verify Redis is running
docker ps | grep fixia-redis

# Test connection
docker exec -it fixia-redis-dev redis-cli ping
# Should return: PONG
```

### Option 2: Windows (Native)

1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Install and run as a service
3. Or run manually:
   ```bash
   redis-server
   ```

### Option 3: WSL2 (Linux on Windows)

```bash
# In WSL2 terminal
sudo apt update
sudo apt install redis-server
sudo service redis-server start

# Test
redis-cli ping
```

## Configuration

Add to your `.env` file:

```bash
# Local development
REDIS_URL="redis://localhost:6379"

# Production (Redis Cloud)
# REDIS_URL="redis://username:password@host:port"
```

## Verify Integration

```bash
# Start the API
cd apps/api
npm run start:dev

# You should see in logs:
# ✅ Redis connected successfully
# ✅ Redis ready to accept commands
# ✅ Advanced rate limiting with Redis enabled
```

## Production Deployment

For production, use a managed Redis service:

### Upstash (Recommended - Free Tier Available)
1. Go to https://upstash.com
2. Create a Redis database
3. Copy the connection string
4. Set `REDIS_URL` in production environment

### Redis Labs
1. Go to https://redis.com/try-free
2. Create a free database
3. Get connection details
4. Set `REDIS_URL` in production environment

### AWS ElastiCache
1. Create an ElastiCache Redis cluster
2. Configure VPC and security groups
3. Use the cluster endpoint as `REDIS_URL`

## Rate Limiting Configuration

The application uses multi-tier rate limiting:

- **Short (Burst Protection)**: 3 requests/second
- **Medium (General API)**: 20 requests/minute
- **Long (Sustained Usage)**: 100 requests/15 minutes

Critical endpoints have custom limits:
- Login: 5 attempts/15 minutes
- Register: 3 attempts/minute
- Password Reset: 3 attempts/15 minutes

## Monitoring

```bash
# Monitor Redis in real-time
redis-cli monitor

# Check memory usage
redis-cli info memory

# View all keys
redis-cli keys "rate_limit:*"

# Check specific rate limit
redis-cli get "rate_limit:/auth/login:ip:127.0.0.1"
```

## Troubleshooting

### Redis not connecting

```bash
# Check if Redis is running
redis-cli ping

# Check logs
docker logs fixia-redis-dev

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

### Rate limiting not working

1. Check Redis connection in API logs
2. Verify `REDIS_URL` is set correctly
3. Test Redis connection manually:
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

## Security Best Practices

1. **Production**: Always use TLS/SSL for Redis connections
2. **Authentication**: Set a strong password for Redis
3. **Network**: Restrict Redis access to your API servers only
4. **Monitoring**: Set up alerts for Redis connection failures
5. **Backups**: Enable Redis persistence (AOF + RDB)

## Performance Tuning

```bash
# In docker-compose.dev.yml, Redis is configured with:
# - maxmemory: 256mb
# - maxmemory-policy: allkeys-lru (evict least recently used)
# - appendonly: yes (persistence)

# For production, adjust based on your needs:
# - Increase maxmemory for higher traffic
# - Use allkeys-lfu for better cache hit rates
# - Enable clustering for high availability
```
