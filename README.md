# Pangolier Chat

A free, open-source chat app designed for seamless collaboration.

Read the full write-up on Pangolier Chat [in this article](https://pangolier.com/chat).

## Why build this?

I was inspired by T3 Chat’s original idea of chat branching and wanted to take it a step further by adding real-time collaboration. Pangolier Chat lets you see other users’ cursors in the interface and view a comprehensive tree of the conversation, including each branch.

T3 Chat also features strong visual design fundamentals (spacing, padding, and color contrast). I wanted to fuse it together with Grok's design aesthetic and added the "Pangolier" design aesthetic ontop.

I also wanted to showcase that Redis is the most scalable choice for real-time, interactive chat applications, especially with its recent updates for [JSON support](https://redis.io/docs/latest/develop/data-types/json/).

### Hard-forking Expression

This project evolves the original [Expression](https://pangolier.com/expression) concept into a more production-ready chat application. It ships without the Notion-style editor, which, I think is somewhat ironic, but, really helps keep the Chat UX focused.

### Potential Future Scope

If people show interest in the project, here are some good ideas:

- Universal Search Tool Call (Google Search API)
- MCP Remote Server Support
- Finish Collaborative Features
- Improve Composability/Tech Debt

## Quick start

The snippet below sets up Pangolier Chat quickly on macOS.
For detailed instructions, see the [documentation](./docs/DEV.md).

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

## Additional Documentation

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
