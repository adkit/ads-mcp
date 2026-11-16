---
name: setup
description: >
  Connect ad platforms to AdKit. Use when the user wants to set up AdKit,
  link their Meta, Google, or TikTok ad accounts, or verify their connection.
  Not for campaign creation, performance analysis, or ad library browsing — 
  use the launch or analyze skills for those.
---

# Setup

## Pick a Project

Call `adkit_projects` and use the returned `projectId` in the calls below. It only auto-resolves when the account has a single project.

```
adkit_projects
```

## Check Current Connection

Call `adkit_status` to see which platforms are connected and what ad accounts are available.

```
adkit_status projectId: "<projectId>"
```

If all platforms are connected and ad accounts are visible, you're ready. If platforms are missing, continue.

## Link a Platform

If platforms are not connected, call `adkit_setup` with the target platform:

```
adkit_setup projectId: "<projectId>" platform: "meta"
```

(Replace `"meta"` with any other value the tool's `platform` field accepts, such as `"google"` or `"tiktok"`.)

The tool returns a browser URL. Share it with the user and ask them to open it and complete the OAuth authorization flow in their browser.

## Verify Connection

After the user confirms they've completed the authorization, check in with your own agent id (for example `"claude-code"` or `"cursor"`):

```
adkit_checkin agentId: "<agentId>"
```

Then check the connection again:

```
adkit_status projectId: "<projectId>"
```

You should now see the connected platform and its ad accounts listed. Setup is complete.
