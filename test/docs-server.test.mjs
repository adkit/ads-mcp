// Boots docs-server/index.mjs the way an MCP client does (stdio) and calls every tool with every allowed input.
// A README edit that empties a section, renames a setup heading or breaks a skill folder fails here, not in a user's chat.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const SERVER = join(REPO, 'docs-server/index.mjs');

let client;
let tools;

before(async () => {
    client = new Client({ name: 'docs-server-test', version: '0.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [SERVER] }));
    ({ tools } = await client.listTools());
});

after(async () => {
    await client?.close();
});

test('lists the tools the main repository ships', () => {
    const names = tools.map((tool) => tool.name).sort();
    // get_faq is only registered when the README has a FAQ section (the single-platform repositories).
    const expected = ['get_example_prompts', 'get_setup_guide', 'get_skill', 'list_ad_platforms', 'list_hosted_tools'];
    for (const name of expected) assert.ok(names.includes(name), `missing tool ${name}; got ${names.join(', ')}`);
});

test('every tool is marked read-only', () => {
    for (const tool of tools) {
        assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} is not readOnlyHint`);
        assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} is not destructiveHint: false`);
    }
});

test('every tool answers every allowed input with non-empty Markdown', async () => {
    for (const tool of tools) {
        for (const args of inputsFor(tool)) {
            const result = await client.callTool({ name: tool.name, arguments: args });
            const label = `${tool.name}(${JSON.stringify(args)})`;
            assert.notEqual(result.isError, true, `${label} returned an error: ${textOf(result)}`);
            // A heading with nothing under it still has some characters, so require real content.
            assert.ok(textOf(result).trim().length > 40, `${label} returned almost nothing: ${JSON.stringify(textOf(result))}`);
        }
    }
});

test('rejects an app that has no setup guide', async () => {
    const result = await client.callTool({ name: 'get_setup_guide', arguments: { app: 'Not An App' } });
    assert.equal(result.isError, true);
});

/**
 * Every argument combination a client may send: one call per enum value, or one call with no arguments.
 */
function inputsFor(tool) {
    const properties = tool.inputSchema?.properties ?? {};
    const enumFields = Object.entries(properties).filter(([, schema]) => Array.isArray(schema.enum));
    if (!enumFields.length) return [{}];
    assert.equal(enumFields.length, 1, `${tool.name} has several enum inputs; extend inputsFor`);
    const [[field, schema]] = enumFields;
    assert.ok(schema.enum.length > 0, `${tool.name}.${field} allows no values`);
    return schema.enum.map((value) => ({ [field]: value }));
}

function textOf(result) {
    return (result.content ?? []).map((part) => part.text ?? '').join('\n');
}

test('a heading-like line inside a code block does not cut the setup guides short', async () => {
    // Shell and TOML snippets often carry "## comment" lines. Before the fence-aware split, one inside the Codex
    // snippet ended the Install section there: Codex lost the rest of its snippet and every later app vanished.
    const dir = mkdtempSync(join(tmpdir(), 'ads-mcp-'));
    try {
        cpSync(REPO, dir, { recursive: true, filter: (path) => !/[\\/](node_modules|\.git)$/.test(path) });
        symlinkSync(join(REPO, 'node_modules'), join(dir, 'node_modules'), 'dir');
        const readme = readFileSync(join(dir, 'README.md'), 'utf8');
        const patched = readme.replace(/^(### Codex[\s\S]*?```[a-z]*\n)/m, '$1## a comment, not a heading\n');
        assert.notEqual(patched, readme, 'could not find the Codex snippet to patch');
        writeFileSync(join(dir, 'README.md'), patched);

        const copy = new Client({ name: 'docs-server-test', version: '0.0.0' });
        await copy.connect(new StdioClientTransport({ command: process.execPath, args: [join(dir, 'docs-server/index.mjs')] }));
        try {
            const { tools: copyTools } = await copy.listTools();
            const apps = copyTools.find((tool) => tool.name === 'get_setup_guide').inputSchema.properties.app.enum;
            assert.deepEqual(apps, setupApps(), 'setup guides changed when a snippet gained a "## " line');
            const codex = await copy.callTool({ name: 'get_setup_guide', arguments: { app: 'Codex' } });
            assert.match(textOf(codex), /## a comment, not a heading\n\[mcp_servers\.adkit\]/);
        } finally {
            await copy.close();
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('setup guides match the "### " headings under Install, and every snippet in them is closed', async () => {
    const apps = tools.find((tool) => tool.name === 'get_setup_guide').inputSchema.properties.app.enum;
    assert.deepEqual(apps, setupApps());
    for (const app of apps) {
        const text = textOf(await client.callTool({ name: 'get_setup_guide', arguments: { app } }));
        const fences = text.split('\n').filter((line) => /^\s*```/.test(line)).length;
        assert.equal(fences % 2, 0, `the ${app} guide has an unclosed code block`);
    }
});

/**
 * The app names under "## Install" in README.md, read line by line and skipping code blocks,
 * independently of the server's own parser.
 */
function setupApps() {
    const apps = [];
    let inInstall = false;
    let inFence = false;
    for (const line of readFileSync(join(REPO, 'README.md'), 'utf8').split('\n')) {
        if (/^\s*```/.test(line)) inFence = !inFence;
        if (inFence) continue;
        if (line.startsWith('## ')) inInstall = ['Install', 'Set up'].includes(line.slice(3).trim());
        else if (inInstall && line.startsWith('### ')) apps.push(line.slice(4).trim());
    }
    return apps;
}
