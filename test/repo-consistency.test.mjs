// Checks that the files describing AdKit to each AI app agree with each other: README, skills, server.json and the
// plugin manifests. Each check names the file to fix when it fails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const README = read('README.md');
const REGISTRY = JSON.parse(read('server.json'));
const HOSTED = new URL(REGISTRY.remotes[0].url);
const SKILLS = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(ROOT, 'skills', entry.name, 'SKILL.md')))
    .map((entry) => entry.name);

test('every JSON file parses', () => {
    for (const file of jsonFiles()) {
        assert.doesNotThrow(() => JSON.parse(read(file)), `${file} is not valid JSON`);
    }
});

test('every hosted server address points at the host in server.json', () => {
    for (const file of jsonFiles()) {
        for (const url of urlsIn(JSON.parse(read(file)))) {
            const parsed = new URL(url);
            if (!parsed.hostname.startsWith('mcp.')) continue;
            assert.equal(parsed.origin, HOSTED.origin, `${file} points at ${url}, server.json at ${HOSTED.origin}`);
        }
    }
});

test('the README setup snippets use the hosted address from server.json', () => {
    const addresses = [...README.matchAll(/https:\/\/mcp\.[a-z0-9.-]+[^\s`"')\]]*/g)].map(([url]) => url);
    assert.ok(addresses.length > 0, 'README.md has no hosted server address');
    for (const url of addresses) assert.equal(new URL(url).origin, HOSTED.origin, `README.md uses ${url}`);
});

test('every tool a skill calls is listed in the README Tools table', () => {
    const listed = toolsInReadmeTable();
    for (const skill of SKILLS) {
        const called = new Set(read(`skills/${skill}/SKILL.md`).match(/\badkit_[a-z_]+/g) ?? []);
        for (const tool of called) assert.ok(listed.has(tool), `skills/${skill}/SKILL.md calls ${tool}, which README.md's Tools table does not list`);
    }
});

test('the README Skills table and the skills/ folder list the same skills', () => {
    const inReadme = new Set([...section('Skills').matchAll(/`\/ads:([a-z-]+)`/g)].map(([, name]) => name));
    assert.deepEqual([...inReadme].sort(), [...SKILLS].sort(), 'README.md Skills table and skills/ disagree');
});

test('every skill declares a name matching its folder and a description', () => {
    for (const skill of SKILLS) {
        const frontMatter = read(`skills/${skill}/SKILL.md`).match(/^---\n([\s\S]*?)\n---/);
        assert.ok(frontMatter, `skills/${skill}/SKILL.md has no front matter`);
        assert.match(frontMatter[1], new RegExp(`^name: ${skill}$`, 'm'), `skills/${skill}/SKILL.md name is not ${skill}`);
        assert.match(frontMatter[1], /^description:/m, `skills/${skill}/SKILL.md has no description`);
    }
});

test('every path a manifest references exists', () => {
    for (const file of jsonFiles()) {
        const base = join(ROOT, file, '..');
        for (const path of pathsIn(JSON.parse(read(file)))) {
            // Claude marketplace sources resolve from the repository root, the rest from the manifest's folder.
            const candidates = [join(base, path), join(ROOT, path)];
            assert.ok(candidates.some((candidate) => existsSync(candidate)), `${file} references ${path}, which does not exist`);
        }
    }
});

// =============================================================================
//                                    HELPERS
// =============================================================================

function read(file) {
    return readFileSync(join(ROOT, file), 'utf8');
}

/**
 * Every .json file in the repository except dependencies and the lockfile.
 */
function jsonFiles(dir = ROOT) {
    const files = [];
    for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.git' || name === 'package-lock.json') continue;
        const path = join(dir, name);
        if (statSync(path).isDirectory()) files.push(...jsonFiles(path));
        else if (name.endsWith('.json')) files.push(relative(ROOT, path));
    }
    return files;
}

/**
 * Every https URL anywhere in a parsed JSON value, including inside argument arrays.
 */
function urlsIn(value) {
    if (typeof value === 'string') return /^https:\/\//.test(value) ? [value] : [];
    if (Array.isArray(value)) return value.flatMap(urlsIn);
    if (value && typeof value === 'object') return Object.values(value).flatMap(urlsIn);
    return [];
}

/**
 * Every relative path ("./something") anywhere in a parsed JSON value.
 */
function pathsIn(value) {
    if (typeof value === 'string') return value.startsWith('./') ? [value] : [];
    if (Array.isArray(value)) return value.flatMap(pathsIn);
    if (value && typeof value === 'object') return Object.values(value).flatMap(pathsIn);
    return [];
}

/**
 * The body of one "## " section of the README, up to the next "## " heading.
 */
function section(heading) {
    const match = README.match(new RegExp(`^## ${heading}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
    assert.ok(match, `README.md has no "## ${heading}" section`);
    return match[1];
}

function toolsInReadmeTable() {
    return new Set([...section('Tools').matchAll(/^\| `(adkit_[a-z_]+)` \|/gm)].map(([, name]) => name));
}
