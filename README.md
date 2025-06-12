# Pangolier Chat

A free, open-source chat app built for seamless collaboration

View a full write up on Pangolier Chat [in this article](https://pangolier.com/chat)

## Why build this?

I was motivated to build this because I thought the original idea of T3Chat (Chat Branching) was great, and, wanted to take it a step further with a collaborative aspect. You can see other user's cursors on the screen and you can see a comprehensive tree of the conversation and branched conversations.

I also think from core visual design style (padding, spacing, color contrast) T3 Chat has some extremely good elements, so it was a good exercise to replicate (with my own touches) to the visual design flows.

Furthermore, I think Redis as a whole being the core database for persisting chat messages is the best option and most scalable. Especially with it's more recent support for [JSON](https://redis.io/docs/latest/develop/data-types/json/).

### Hard Forking Expression

This took the original [Expression](https://pangolier.com/expression) features and refined and ramped it up to be closer to a production level Chat App. Unfortunately, there is no Notion style editor (since we are opting for a very focused Chat Interface, not a free form UI).

## Quick Start

The following is a snippet for setting up on MacOS quickly.

You can review more comprehensive [documentation here](./docs/DEV.md).

```bash
# Setup redis-stack-server
brew tap redis-stack/redis-stack
brew install --cask redis-stack
redis-stack-server # Can be configured as a launchd service

# Setup postgres locally
brew install postgresql@17
brew services start postgresql@17

# Fill in your .env with the proper keys
cp .env.sample .env

# Install node_modules and sync
bun install
bun run prisma:sync

# Run and view on http://localhost:3000
bun run dev
```

## Documentation

- [Local Development Setup](./docs/DEV.md)

- [Deployment Workflow](./docs/DEPLOY.md)

- [Google SSO Setup](./docs/GOOGLE.md)

- [Github SSO Setup](./docs/GITHUB.md)

## Footnotes

If you found this template useful, tip me on Solana:

```crypto
G8rJdb6kg5hNuQFD8Dmwfh1Zb4X8TGBk8F1PCVQ219AT
```

If you want to work with me, please email me at <hello@pangolier.com>
