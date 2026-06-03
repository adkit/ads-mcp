![Ads MCP - let your AI agents manage your ads across Google Ads, Meta Ads, and TikTok Ads](https://adkit.so/images/og-image.png)

# Ads MCP - Manage your ads from any AI agent

**Ads MCP** is a Model Context Protocol (MCP) server for managing ad campaigns across **Google Ads, Meta Ads, and TikTok Ads** from any MCP-compatible AI assistant — Claude, Claude Code, ChatGPT, Cursor, and Codex. Create campaigns, analyze performance, and spy on competitor ads without leaving your chat.

> **Draft-first:** every change starts as a draft — nothing goes live without your explicit approval. Multi-account for agencies and teams.

## What it does

- **Create campaigns** — Build campaigns from scratch with audience research, keyword targeting, and media uploads
- **Analyze performance** — Pull metrics with date, placement, and demographic breakdowns; diagnose why ROAS dropped
- **Spy on competitor ads** — Search real ad libraries to research strategies, creative formats, and landing pages
- **Generate creatives** — Use AI to create ad images and copy from a brief
- **Connect ad accounts** — Link multiple Meta, Google, and TikTok accounts in one workspace

## Platforms & tools

| Platform | What you can do |
| --- | --- |
| **Google Ads** | Search campaigns, keyword targeting, performance analysis, optimization |
| **Meta Ads** (Facebook + Instagram) | Campaign creation, audience targeting, performance breakdowns, competitor ad spying |
| **TikTok Ads** | Campaign creation and performance analysis |

## Install

### Claude Code (recommended)

```
/plugin marketplace add adkit/ads-mcp
/plugin install ads@adkit
```

Then run `/ads:setup` to connect your ad accounts.

**MCP-only (no plugin):**

```
claude mcp add --transport http adkit https://mcp.adkit.so
```

### Claude (desktop & web)

Settings → **Connectors** → **Add custom connector** → URL: `https://mcp.adkit.so` → sign in on first use.

### ChatGPT

Settings → **Connectors** → **Add custom connector** → URL: `https://mcp.adkit.so`

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "adkit": {
      "url": "https://mcp.adkit.so"
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.adkit]
url = "https://mcp.adkit.so"
```

## Skills

| Skill           | Description                                  |
| --------------- | -------------------------------------------- |
| `/ads:setup`    | Connect your ad accounts                     |
| `/ads:launch`   | Create campaigns, ad sets, and ads           |
| `/ads:analyze`  | Pull performance data and metrics            |
| `/ads:spy`      | Research competitor ads across ad libraries  |
| `/ads:studio`   | Generate ad images and copy with AI          |

## How it works

The plugin connects to the AdKit MCP server, which manages your ad accounts across platforms. It follows a **draft-first workflow** — nothing publishes without your explicit approval. Supports multi-account setups for agencies and teams.

## Learn more

- [Google Ads MCP](https://adkit.so/features/ads-mcp/google) — connect Google Ads to your AI assistant
- [Meta Ads MCP](https://adkit.so/features/ads-mcp/meta) — connect Facebook & Instagram Ads
- [TikTok Ads MCP](https://adkit.so/features/ads-mcp/tiktok) — connect TikTok Ads
- [Claude integration](https://adkit.so/integrations/claude) — full setup guide for Claude
- [AdKit Dashboard](https://adkit.so) — account management and documentation

## Strategy skills

For campaign planning and platform-specific strategy, pair this plugin with the free [Ads Strategy Skills](https://github.com/adkit-so/skills).

## License

MIT
