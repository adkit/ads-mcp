// This file contains a small MCP server that answers questions about the hosted AdKit MCP server: setup per AI app,
// the hosted tools, the supported ad platforms, example prompts, the FAQ and the agent skills.
// It reads this repository's README.md, server.json and skills/ folder, so it never drifts from the docs.
// It is not the hosted AdKit server: managing ads needs the hosted address in server.json.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const repoUrl = new URL('..', import.meta.url);
const ROOT = fileURLToPath(repoUrl);
const README = readRepoFile('README.md');
const registryJson = readRepoFile('server.json');
const REGISTRY = JSON.parse(registryJson);
const HOSTED_URL = REGISTRY.remotes[0].url;

// "Meta Ads MCP Server by AdKit" names one platform; the main repository covers all platforms.
const platformMatch = REGISTRY.title.match(/^(.+) MCP Server by AdKit/);
const SERVER_LABEL = platformMatch ? `${platformMatch[1]} MCP server by AdKit` : 'AdKit MCP server';

// Every tool only reads files from this repository.
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const sections = splitByHeading(README, '## ');
const setupSection = findSection(['Set up', 'Install']);
const setupGuides = splitByHeading(setupSection, '### ');
const appNames = Object.keys(setupGuides);
const skills = readSkills();
const skillNames = Object.keys(skills);

const server = new McpServer({ name: `${REGISTRY.name}-docs`, version: REGISTRY.version });

server.registerTool(
    'get_setup_guide',
    {
        title: 'Get setup guide',
        description: `Get the step-by-step instructions to connect one AI app to the hosted ${SERVER_LABEL} at ${HOSTED_URL}. Use this when the user asks how to install, add or connect AdKit in a specific app. Returns Markdown with the exact menu path, command or config snippet. For what the hosted server can do once connected, use list_hosted_tools instead.`,
        inputSchema: { app: z.enum(appNames).describe('The AI app to connect, exactly as listed.') },
        annotations: { title: 'Get setup guide', ...READ_ONLY },
    },
    ({ app }) => answer(`## ${app}\n\n${setupGuides[app]}`),
);

server.registerTool(
    'list_hosted_tools',
    {
        title: 'List hosted tools',
        description: `List the tools of the hosted ${SERVER_LABEL} (${HOSTED_URL}), with one line on what each tool does. Use this to explain what an agent can do with ad accounts after connecting, such as creating campaigns, pulling performance or uploading media. Returns a Markdown table. It does not call those tools; they only run on the hosted server.`,
        annotations: { title: 'List hosted tools', ...READ_ONLY },
    },
    () => answer(findSection(['Tools'])),
);

server.registerTool(
    'list_ad_platforms',
    {
        title: 'List ad platforms',
        description: "List the ad platforms AdKit supports (Google, Meta, TikTok, LinkedIn, Microsoft, Reddit, X, Pinterest) and the link to each platform's own MCP server and setup page. Use this when the user asks which ad platforms are supported or wants a server for one platform only. Returns Markdown.",
        annotations: { title: 'List ad platforms', ...READ_ONLY },
    },
    () => answer(findSection(['Platforms & tools', 'Other ad platforms', 'One platform only'])),
);

server.registerTool(
    'get_example_prompts',
    {
        title: 'Get example prompts',
        description: `Get example prompts that work with the hosted ${SERVER_LABEL}, such as reporting, optimizing and launching campaigns. Use this when the user asks what to try first or what to ask the agent. Returns a Markdown list.`,
        annotations: { title: 'Get example prompts', ...READ_ONLY },
    },
    () => answer(findSection(['Example prompts'])),
);

// The single-platform repositories have a FAQ section; the main repository does not.
if (sections.FAQ) {
    server.registerTool(
        'get_faq',
        {
            title: 'Get FAQ',
            description: `Get the answers to common questions about the hosted ${SERVER_LABEL}: price, safety and approvals, API keys, several ad accounts and supported AI apps. Use this before answering such a question from memory. Returns Markdown, one heading per question.`,
            annotations: { title: 'Get FAQ', ...READ_ONLY },
        },
        () => answer(sections.FAQ),
    );
}

// Only the main repository ships agent skills.
if (skillNames.length) {
    server.registerTool(
        'get_skill',
        {
            title: 'Get agent skill',
            description: "Get the full instructions of one AdKit agent skill (SKILL.md): setup connects ad accounts, launch creates campaigns, analyze pulls performance, spy researches competitor ads, studio generates creatives. Use this to follow AdKit's workflow for that job step by step. Returns Markdown.",
            inputSchema: { skill: z.enum(skillNames).describe('The skill to read.') },
            annotations: { title: 'Get agent skill', ...READ_ONLY },
        },
        ({ skill }) => answer(skills[skill]),
    );
}

const transport = new StdioServerTransport();
await server.connect(transport);

// =============================================================================
//                              REPOSITORY READING
// =============================================================================

/**
 * Read a file from the repository root.
 */
function readRepoFile(name) {
    const path = join(ROOT, name);
    return readFileSync(path, 'utf8');
}

/**
 * Split Markdown into the parts under each heading of one level ("## " or "### "), keyed by heading text.
 */
function splitByHeading(markdown, marker) {
    const headingPattern = new RegExp(`^${marker}`, 'm');
    const parts = markdown.split(headingPattern).slice(1);
    const entries = parts.map((part) => {
        const [heading, ...body] = part.split('\n');
        const text = body.join('\n');
        return [heading.trim(), text.trim()];
    });
    return Object.fromEntries(entries);
}

/**
 * Join the README sections found among these headings. Fails at start when none exists, so a broken README cannot ship.
 */
function findSection(headings) {
    const found = headings.filter((heading) => sections[heading]);
    if (!found.length) throw new Error(`README.md has none of these sections: ${headings.join(', ')}`);
    const texts = found.map((heading) => sections[heading]);
    return texts.join('\n\n');
}

/**
 * Read every skills/<name>/SKILL.md, keyed by folder name. Returns an empty object when there is no skills folder.
 */
function readSkills() {
    const folder = join(ROOT, 'skills');
    if (!existsSync(folder)) return {};
    const entries = readdirSync(folder, { withFileTypes: true });
    const skillFolders = entries.filter((entry) => entry.isDirectory() && existsSync(join(folder, entry.name, 'SKILL.md')));
    const pairs = skillFolders.map((entry) => [entry.name, readRepoFile(`skills/${entry.name}/SKILL.md`)]);
    return Object.fromEntries(pairs);
}

/**
 * Wrap Markdown in an MCP text result.
 */
function answer(text) {
    return { content: [{ type: 'text', text }] };
}
