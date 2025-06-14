# Local Development Workflow

## Requirements

1. Postgres

2. Redis v7 with JSON support

3. Bun (recommended)

## Setup Workflow

### Redis

**MacOS**:

```bash
brew tap redis-stack/redis-stack
brew install --cask redis-stack
redis-stack-server # Can be configured as a launchd service
```

### Postgres

**MacOS**:

```bash
brew install postgresql@17
brew services start postgresql@17
```
