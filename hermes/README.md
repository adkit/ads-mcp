# AdKit for Hermes Agent

Manage your ads on **Google Ads, Meta Ads (Facebook, Instagram), TikTok Ads, LinkedIn Ads, Microsoft Ads, Reddit Ads, and X Ads** from Hermes. This package connects Hermes to the hosted AdKit MCP server at `mcp.adkit.so`.

- **Launch campaigns:** campaigns, ad sets, ads, keywords, and media uploads. Every change starts as a draft.
- **Pull reports:** spend, ROAS, conversions, search terms, with date, placement, and demographic breakdowns.
- **Browse competitor ads:** search the ad library across Meta, Google, and LinkedIn.
- **Generate creatives:** ad images and copy from a brief.
- **Several ad accounts in one place:** built for agencies and teams that run many accounts.

## Install

```
hermes plugins install adkit
hermes plugins enable adkit
```

Requires Node.js 20.18.1+ and npm. Sign-in runs through `npx mcp-remote@0.1.49` (pinned) because Hermes does not run OAuth for MCP servers declared by a plugin.

## Sign in

On first use, a browser window opens to sign in to AdKit. Then ask Hermes to connect your ad platforms; AdKit returns a link for each one.

## Example prompts

- "How are my Google Ads doing this week? Which keywords spent money without converting?"
- "What ads is Notion running on Meta right now? Which ones have been live the longest?"
- "Create a Meta campaign for our spring sale. $50/day, US only. Draft it, don't publish."
- "Give me an overview of all my client accounts. Which ones need attention today?"

## Tools

| Tool | What it does |
| --- | --- |
| `adkit_projects` | List your projects and pick one to work in |
| `adkit_status` | Show connected platforms and ad accounts |
| `adkit_setup` | Get links to connect your ad platforms |
| `adkit_help` | Look up what each platform supports, with exact params |
| `adkit_manage` | Create, edit, and publish campaigns, ad sets, and ads. Pull performance reports |
| `adkit_library` | Search ads on Meta, Google, and LinkedIn |
| `adkit_studio` | Generate ad images and copy from a brief |
| `adkit_upload_file` | Upload images and videos for your ads |
| `adkit_integrations` | Read connected GA4 and Google Search Console data |
| `adkit_feedback` | Report bugs or missing features to the AdKit team |
| `adkit_checkin` | Confirm your setup worked during onboarding |

The tool list comes from the hosted server at runtime. The pinned commit covers this package's configuration only.

## What to know before you install

- **It changes real ad accounts.** Campaigns you publish spend your ad budget. Creates start as drafts and publish only when you approve.
- **Hermes asks before every write.** The package marks the `adkit` server as untrusted, so Hermes asks before each tool call that is not read-only, and refuses those calls in cron and other unattended runs.
- **Network calls.** Every tool call goes to `mcp.adkit.so`. Sign-in uses `npx mcp-remote@0.1.49`, which downloads from the npm registry and stores its OAuth tokens in `~/.mcp-auth`.
- **No telemetry.** The package itself sends nothing. `adkit_feedback` and `adkit_checkin` send data to AdKit only when the agent calls them.

## Links

- [AdKit](https://adkit.so)
- [Ads MCP setup guides](https://adkit.so/features/ads-mcp)
- [Privacy policy](../PRIVACY.md)
- [Security](../SECURITY.md)
