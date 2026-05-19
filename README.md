# Ads — Claude Code Plugin

Manage ad campaigns on Meta, Google, and TikTok from Claude Code. Create campaigns, spy on competitor ads, and generate AI creatives.

## Install

```
/plugin install ads
```

Or add the MCP server directly:

```
claude mcp add --transport http adkit https://mcp.adkit.so
```

## What it does

- **Connect ad accounts** — Link multiple Meta, Google, and TikTok accounts without leaving your workflow
- **Create campaigns** — Build campaigns from scratch with audience research, keyword targeting, and media uploads
- **Analyze performance** — Review ad performance, diagnose delivery issues, and identify optimization opportunities
- **Browse competitor ads** — Search a library of real ads to research strategies and creative approaches
- **Generate creatives** — Use AI to create ad images and copy tailored to your campaign brief

## Skills

| Skill           | Description                                       |
| --------------- | ------------------------------------------------- |
| `/ads:setup`    | Connect your ad accounts                          |
| `/ads:launch`   | Create campaigns, ad sets, and ads                |
| `/ads:analyze`  | Pull performance data and metrics                 |
| `/ads:spy`      | Research competitor ads across ad libraries        |
| `/ads:studio`   | Generate ad images and copy with AI               |

## How it works

The plugin connects to the AdKit MCP server, which manages your ad accounts across platforms. It follows a **draft-first workflow** — nothing goes live without your explicit approval. Supports multi-account setups for agencies and teams.

## Strategy skills

For campaign planning and platform-specific strategy, pair this plugin with the free [Ads Strategy Skills](https://github.com/adkit-so/skills).

## Links

- [AdKit Dashboard](https://adkit.so) — Account management and documentation
- [Strategy Skills](https://github.com/adkit-so/skills) — Meta & Google ads strategy for AI agents

## License

MIT
