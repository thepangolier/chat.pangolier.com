# Pangolier Chat

A free, open-source chat app designed for seamless collaboration.

Read the full write-up on Pangolier Chat [in this article](https://pangolier.com/chat).

## Why build this?

I really like the design elements of T3 Chat, the color composition is much better then any of the big chat UIs. I also like a lot of the concepts from Grok (the header and history components more specifically). Thus, I fused the design elements I really like from T3 Chat and fused it with Grok.

If the project gets visibility, I'll continue working through the SSE implementations and get it closer to "Figma for chat".

---

I originally started building this with the intent of demonstrating "Figma for chat". Building off of the original T3 Chat idea of "branching" but taking it a step further where you can share branches with other people and you can interact with a chat tree in real time.

The problem though, is that I did not get enough time to  implement even the baseline SSE where users can sync clients together.

### Hard-forking Expression

This project evolves the original concepts from [Expression](https://pangolier.com/expression) into a more production-ready chat application. It ships without the Notion-style editor, which, I think is somewhat ironic, but, really helps keep the Chat UX focused.

## Future Scope

If people show interest in the project, here are some good ideas:

- Universal Search Tool Call (Google Search API)
- MCP Remote Server Support
- Attachments
- Image Generation
- Finish Collaborative Features
- Syntax Highlighting (with Shiki?)
- OpenAI Reasoning Support
- SSE and Real time client sync
- Resume Streams/Retry
- **Improve Composability/Tech Debt**

Feel free to pitch in, but, if people want to use this project these are the priority tasks.

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
