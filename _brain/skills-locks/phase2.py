# -*- coding: utf-8 -*-
"""Phase 2 of the skills update (2026-11-20). Auditor's own script; it copies
audited files from the staging folder into C:\\Users\\tvarv\\.claude by hand,
the way the upstream installers would, WITHOUT running any upstream code.

Usage (run with `python -I`):
  phase2.py plan      print every action, change nothing
  phase2.py backup    move current versions into the backup / disabled folders
  phase2.py install   copy the audited versions + apply the documented edits
  phase2.py verify    prove installed files == audited files (+ only the documented edits)

Nothing is ever deleted. Moves are same-volume renames that refuse to overwrite.
`backup` and `install` can be re-run after an interruption: finished items are skipped.
(Revised after the three-lens pre-flight review of 2026-11-20.)
"""
import hashlib
import io
import json
import os
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HOME = r'C:\Users\tvarv'
CLAUDE = os.path.join(HOME, '.claude')
STAGING = os.path.join(HOME, 'skills-staging')
AUD = os.path.join(STAGING, '_audit')
BACKUP = os.path.join(CLAUDE, '_backup-2026-11-20')
DISABLED = os.path.join(CLAUDE, '_disabled-2026-11-20')

SEO_SRC = os.path.join(STAGING, 'claude-seo-v2.6.2')
SEO_COMMIT = '468ed5b0d9e3249394783710e54abb02837e326b'
MKT_SRC = os.path.join(STAGING, 'marketingskills-v2.14.25')
MKT_COMMIT = '5b2b400eec1e7e1cec76245a715d0b0d4fd2a9c1'

# --- what is installed today -------------------------------------------------
SEO_SKILLS_OLD = ['seo', 'seo-audit', 'seo-backlinks', 'seo-cluster', 'seo-competitor-pages',
                  'seo-content', 'seo-content-brief', 'seo-drift', 'seo-ecommerce', 'seo-flow',
                  'seo-geo', 'seo-google', 'seo-hreflang', 'seo-images', 'seo-local', 'seo-maps',
                  'seo-page', 'seo-plan', 'seo-programmatic', 'seo-schema', 'seo-sitemap',
                  'seo-sxo', 'seo-technical']
SEO_AGENTS_OLD = ['seo-backlinks', 'seo-cluster', 'seo-content', 'seo-drift', 'seo-ecommerce',
                  'seo-flow', 'seo-geo', 'seo-google', 'seo-local', 'seo-maps', 'seo-performance',
                  'seo-schema', 'seo-sitemap', 'seo-sxo', 'seo-technical', 'seo-visual']
MKT_SKILLS = ['cro', 'copywriting', 'copy-editing', 'ab-testing', 'analytics', 'emails', 'offers', 'signup']

# --- what gets installed (owner's decision 2026-11-20) -----------------------
SEO_SKILLS_NEW = SEO_SKILLS_OLD + ['seo-agentic']
SEO_AGENTS_NEW = SEO_AGENTS_OLD + ['seo-agentic']
# Present upstream, deliberately NOT installed (need API keys / MCP servers, or excluded by the owner).
SEO_SKILLS_SKIPPED = ['seo-bing', 'seo-shopify', 'seo-posthog', 'seo-dataforseo', 'seo-image-gen']
SEO_AGENTS_SKIPPED = ['seo-posthog', 'seo-dataforseo', 'seo-image-gen']
# Core scripts left out: the owner excluded /seo unlighthouse (and the script passes the
# target URL to npx.cmd unescaped on Windows). Nothing else imports them.
SEO_SCRIPTS_EXCLUDED = ['unlighthouse_run.py', 'unlighthouse_http_proxy.cjs']
# Repo-root folders the upstream installer copies into skills/seo/.
SEO_ROOT_DIRS = ['scripts', 'schema', 'data']
# Not copied: hooks/ (only works as a plugin, no skill references it), extensions/, tests/, docs/.

# The same four replacements install.ps1 (lines 298-299 and 339-347) applies to copied .md files.
HOME_FWD = HOME.replace('\\', '/')
REWRITES = [
    (b'"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run', b'"$HOME/.claude/skills/seo/scripts/claude-seo" run'),
    (b'"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" setup', b'"$HOME/.claude/skills/seo/scripts/claude-seo" setup'),
    (b'"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" doctor', b'"$HOME/.claude/skills/seo/scripts/claude-seo" doctor'),
    (b'${CLAUDE_PLUGIN_ROOT}/skills/', (HOME_FWD + '/.claude/skills/').encode()),
]
TOKEN = b'CLAUDE_PLUGIN_ROOT'
# After the four replacements exactly ONE mention remains in instruction files: a sentence of
# prose that explains the mechanism (the upstream installer leaves it too). Reviewed by hand.
ALLOWED_PROSE = {('skills/seo/SKILL.md', b'`${CLAUDE_PLUGIN_ROOT}` to the installed plugin directory, so the launcher is')}
# Unmodified audited scripts that mention the name in comments/help text or read the
# environment variable by design (runtime.py line 106). They must stay byte-identical.
TOKEN_IN_CODE_OK = {'skills/seo/scripts/claude-seo', 'skills/seo/scripts/runtime.py',
                    'skills/seo/scripts/consistency_check.py', 'skills/seo/scripts/matomo_auth.py'}

# marketingskills: pin links that point at the moving main branch to the audited commit.
MKT_LINK_OLD = b'https://github.com/coreyhaines31/marketingskills/blob/main/'
MKT_LINK_NEW = ('https://github.com/coreyhaines31/marketingskills/blob/%s/' % MKT_COMMIT).encode()
MKT_EXPECTED_LINKS = 18

DRY = True
LOG = []


def log(msg):
    LOG.append(msg)
    print(msg)


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for block in iter(lambda: fh.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def rel_claude(path):
    return os.path.relpath(path, CLAUDE).replace('\\', '/')


def is_reparse(path):
    """True for symlinks and NTFS junctions (must never be moved with a plain rename here)."""
    try:
        return os.path.islink(path) or os.path.isjunction(path)
    except AttributeError:
        return os.path.islink(path)


def move(src, dst):
    """Same-volume rename. Refuses to overwrite; skips if already done (resumable)."""
    if not os.path.exists(src):
        if os.path.exists(dst):
            log('  already moved: %s' % dst)
            return
        raise SystemExit('STOP: source missing and destination missing: %s' % src)
    if os.path.exists(dst):
        raise SystemExit('STOP: destination already exists, refusing to overwrite: %s' % dst)
    if is_reparse(src):
        raise SystemExit('STOP: %s is a symlink/junction; not expected here' % src)
    log('  MOVE %s -> %s' % (src, dst))
    if DRY:
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    for attempt in range(8):
        try:
            os.rename(src, dst)
            return
        except PermissionError as exc:
            # A scanner or a file watcher can hold a handle for a moment (same pattern as
            # upstream runtime.py _replace_with_retry).
            if attempt == 7:
                raise SystemExit('STOP: cannot move %s (%s). Something holds a handle inside it. '
                                 'This item was NOT moved; earlier moves stand; re-run `backup` to continue.'
                                 % (src, exc))
            time.sleep(0.5 * (attempt + 1))


def walk_files(root):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in ('__pycache__', '.git')]
        for f in files:
            yield os.path.join(base, f)


def copy_file(src, dst, transform=None):
    """Copy one file byte-for-byte (optionally transformed). Never overwrites different
    content; an existing identical file is accepted so an interrupted run can resume.
    Returns True when the written bytes differ from the source (a documented local edit)."""
    data = open(src, 'rb').read()
    out = transform(data) if transform else data
    if os.path.exists(dst):
        if os.path.isfile(dst) and open(dst, 'rb').read() == out:
            return out != data
        raise SystemExit('STOP: destination exists with different content: %s' % dst)
    if not DRY:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, 'wb') as fh:
            fh.write(out)
    return out != data


def rewrite_seo(data):
    for old, new in REWRITES:
        data = data.replace(old, new)
    return data


def pin_mkt(data):
    return data.replace(MKT_LINK_OLD, MKT_LINK_NEW)


# ----------------------------------------------------------------------------
def seo_copy_plan():
    """Yield (src, dst, kind) for every SEO file to install. kind: 'md' gets the rewrite."""
    for name in SEO_SKILLS_NEW:
        src_dir = os.path.join(SEO_SRC, 'skills', name)
        if not os.path.isdir(src_dir):
            raise SystemExit('STOP: staging has no skills/%s' % name)
        for f in walk_files(src_dir):
            rel = os.path.relpath(f, src_dir)
            yield f, os.path.join(CLAUDE, 'skills', name, rel), ('md' if f.lower().endswith('.md') else 'raw')
    seo_dst = os.path.join(CLAUDE, 'skills', 'seo')
    for d in SEO_ROOT_DIRS:
        src_dir = os.path.join(SEO_SRC, d)
        for f in walk_files(src_dir):
            rel = os.path.relpath(f, src_dir)
            if d == 'scripts' and rel in SEO_SCRIPTS_EXCLUDED:
                continue
            # install.ps1 rewrites only .md under skills/ and agents/; files under scripts/,
            # schema/ and data/ are copied untouched.
            yield f, os.path.join(seo_dst, d, rel), 'raw'
    yield os.path.join(SEO_SRC, 'requirements.txt'), os.path.join(seo_dst, 'requirements.txt'), 'raw'
    yield os.path.join(SEO_SRC, '.claude-plugin', 'plugin.json'), os.path.join(seo_dst, 'runtime-plugin.json'), 'raw'
    for name in SEO_AGENTS_NEW:
        yield os.path.join(SEO_SRC, 'agents', name + '.md'), os.path.join(CLAUDE, 'agents', name + '.md'), 'md'


def mkt_copy_plan():
    """Markdown only: SKILL.md + references/**/*.md. No evals, no AGENTS.md, no tools."""
    for name in MKT_SKILLS:
        src_dir = os.path.join(MKT_SRC, 'skills', name)
        for f in walk_files(src_dir):
            rel = os.path.relpath(f, src_dir)
            first = rel.split(os.sep)[0]
            if first == 'evals' or not f.lower().endswith('.md'):
                continue
            yield f, os.path.join(CLAUDE, 'skills', name, rel), 'md'


def backup_items():
    """(original path, backup path) for everything that leaves its place."""
    items = []
    for name in SEO_SKILLS_OLD + MKT_SKILLS:
        items.append((os.path.join(CLAUDE, 'skills', name), os.path.join(BACKUP, 'skills', name)))
    for name in SEO_AGENTS_OLD:
        items.append((os.path.join(CLAUDE, 'agents', name + '.md'), os.path.join(BACKUP, 'agents', name + '.md')))
    items.append((os.path.join(CLAUDE, 'skills', 'marketing-skill'), os.path.join(DISABLED, 'skills', 'marketing-skill')))
    return items


def unexpected_seo_entries():
    """SEO-looking entries in skills/ or agents/ that this script does not manage."""
    out = []
    known_s = set(SEO_SKILLS_NEW)
    known_a = set(a + '.md' for a in SEO_AGENTS_NEW)
    for entry in sorted(os.listdir(os.path.join(CLAUDE, 'skills'))):
        if entry.lower().startswith('seo') and entry not in known_s:
            out.append('skills/' + entry)
    for entry in sorted(os.listdir(os.path.join(CLAUDE, 'agents'))):
        if entry.lower().startswith('seo') and entry not in known_a:
            out.append('agents/' + entry)
    return out


def cmd_backup():
    log('== BACKUP (move, never delete) ==')
    for src, dst in backup_items():
        move(src, dst)
    for entry in unexpected_seo_entries():
        log('  NOTE: unexpected entry left in place: %s' % entry)


def cmd_install():
    # ---- preflight: validate everything before the first write ----
    seo_plan, mkt_plan = list(seo_copy_plan()), list(mkt_copy_plan())
    for src, dst, kind in seo_plan + mkt_plan:
        if not os.path.isfile(src):
            raise SystemExit('STOP: staging file missing: %s' % src)
    links = sum(open(s, 'rb').read().count(MKT_LINK_OLD) for s, d, k in mkt_plan)
    if links != MKT_EXPECTED_LINKS:
        raise SystemExit('STOP: expected %d main-branch links, found %d' % (MKT_EXPECTED_LINKS, links))
    if not DRY:
        for orig, bak in backup_items():
            if not os.path.exists(bak):
                raise SystemExit('STOP: backup has not completed (missing %s). Run `backup` first.' % bak)
    log('== INSTALL claude-seo v2.6.2 (%s) ==' % SEO_COMMIT[:7])
    modified = [rel_claude(dst) for src, dst, kind in seo_plan if copy_file(src, dst, rewrite_seo if kind == 'md' else None)]
    log('  files copied: %d ; rewritten (plugin-root placeholder): %d' % (len(seo_plan), len(modified)))
    log('== INSTALL marketingskills v2.14.25 (%s), 8 skills, markdown only ==' % MKT_COMMIT[:7])
    pinned = [rel_claude(dst) for src, dst, kind in mkt_plan if copy_file(src, dst, pin_mkt)]
    log('  files copied: %d ; files with pinned links: %d ; links pinned: %d' % (len(mkt_plan), len(pinned), links))
    prov_seo = ('source: https://github.com/AgriciDaniel/claude-seo\n'
                'version: v2.6.2\ncommit: %s\ninstalled: 2026-11-20 (manual copy, upstream installer NOT run)\n'
                'audited: 2026-11-20, see Oak-Fantasy _brain/SKILLS-MANIFEST.md\n'
                'installed-skills: %s\ninstalled-agents: %s\n'
                'not-installed: skills %s; agents %s; scripts %s; hooks/; extensions/\n'
                'local-edits: the 4 plugin-root placeholder replacements from install.ps1 in %d .md files\n'
                % (SEO_COMMIT, ' '.join(SEO_SKILLS_NEW), ' '.join(SEO_AGENTS_NEW), ' '.join(SEO_SKILLS_SKIPPED),
                   ' '.join(SEO_AGENTS_SKIPPED), ' '.join(SEO_SCRIPTS_EXCLUDED), len(modified)))
    prov_mkt = ('source: https://github.com/coreyhaines31/marketingskills\n'
                'version: v2.14.25 (tag was less than 24 hours old at install time)\ncommit: %s\n'
                'installed: 2026-11-20 (manual copy, markdown only, no evals, no AGENTS.md)\n'
                'audited: 2026-11-20, see Oak-Fantasy _brain/SKILLS-MANIFEST.md\n'
                'installed-skills: %s\n'
                'local-edits: %d links .../blob/main/... pinned to .../blob/%s/... in: %s\n'
                % (MKT_COMMIT, ' '.join(MKT_SKILLS), links, MKT_COMMIT, ' '.join(pinned)))
    for path, text in ((os.path.join(CLAUDE, 'skills', 'seo', '.provenance'), prov_seo),
                       (os.path.join(CLAUDE, 'skills', 'cro', '.provenance'), prov_mkt)):
        log('  WRITE %s' % path)
        if not DRY:
            with open(path, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(text)
    if not DRY:
        json.dump({'seo_rewritten': modified, 'mkt_pinned': pinned},
                  open(os.path.join(AUD, 'phase2-modified-files.json'), 'w', encoding='utf-8'), indent=1)


def cmd_verify():
    """Installed == audited staging, except exactly the documented edits. Read-only."""
    problems, checked, rewritten, pinned = [], 0, [], []
    expected_paths = set()
    for plan, transform in ((seo_copy_plan(), rewrite_seo), (mkt_copy_plan(), pin_mkt)):
        for src, dst, kind in plan:
            expected_paths.add(os.path.normcase(dst))
            if not os.path.isfile(dst):
                problems.append('MISSING ' + dst)
                continue
            src_bytes = open(src, 'rb').read()
            want = transform(src_bytes) if kind == 'md' else src_bytes
            got = open(dst, 'rb').read()
            checked += 1
            if got != want:
                problems.append('DIFFERS ' + dst)
            elif want != src_bytes:
                (rewritten if transform is rewrite_seo else pinned).append(dst)

    # Nothing extra inside the installed skill folders. The runtime created by setup is
    # tolerated ONLY at the root of skills/seo; bytecode only under skills/seo/scripts.
    seo_root = os.path.normcase(os.path.join(CLAUDE, 'skills', 'seo'))
    runtime_ok = {'.venv', 'ms-playwright', 'runtime-state.json', '.setup.lock'}
    pyc_ok = os.path.normcase(os.path.join(CLAUDE, 'skills', 'seo', 'scripts', '__pycache__'))
    prov_ok = {os.path.normcase(os.path.join(CLAUDE, 'skills', n, '.provenance')) for n in ('seo', 'cro')}
    runtime_found = []
    for name in SEO_SKILLS_NEW + MKT_SKILLS:
        for base, dirs, files in os.walk(os.path.join(CLAUDE, 'skills', name)):
            at_root = os.path.normcase(base) == seo_root
            keep = []
            for d in dirs:
                full = os.path.normcase(os.path.join(base, d))
                if at_root and d in runtime_ok:
                    runtime_found.append(d)
                elif full == pyc_ok:
                    pass
                elif at_root and (d.startswith('.venv.') or d == '.venv.previous'):
                    problems.append('LEFTOVER OF A FAILED SETUP ' + os.path.join(base, d))
                else:
                    keep.append(d)
            dirs[:] = keep
            for f in files:
                p = os.path.join(base, f)
                np = os.path.normcase(p)
                if np in expected_paths or np in prov_ok:
                    continue
                if at_root and f in runtime_ok:
                    runtime_found.append(f)
                    continue
                problems.append('EXTRA ' + p)
    for name in SEO_AGENTS_NEW:
        expected_paths.add(os.path.normcase(os.path.join(CLAUDE, 'agents', name + '.md')))
    for entry in unexpected_seo_entries():
        problems.append('UNEXPECTED ' + entry)
    for orig, bak in backup_items():
        if not os.path.exists(bak):
            problems.append('BACKUP MISSING ' + bak)

    # Placeholder left in instruction files / code, and unpinned links.
    md_ok, md_bad, code_ok = [], [], []
    scan = []
    for name in SEO_SKILLS_NEW:
        for base, dirs, files in os.walk(os.path.join(CLAUDE, 'skills', name)):
            dirs[:] = [d for d in dirs if d not in ('.venv', 'ms-playwright', '__pycache__')]
            scan += [os.path.join(base, f) for f in files]
    scan += [os.path.join(CLAUDE, 'agents', n + '.md') for n in SEO_AGENTS_NEW]
    for p in scan:
        if not os.path.isfile(p):
            continue
        data = open(p, 'rb').read()
        if TOKEN not in data:
            continue
        rel = rel_claude(p)
        if rel in TOKEN_IN_CODE_OK:
            code_ok.append((rel, data.count(TOKEN)))
            continue
        for i, line in enumerate(data.splitlines(), 1):
            if TOKEN in line:
                entry = (rel, i, line.decode('utf-8', 'replace').strip()[:150])
                if any(rel == r and frag in line for r, frag in ALLOWED_PROSE):
                    md_ok.append(entry)
                else:
                    md_bad.append(entry)
    unpinned = []
    needles = (b'marketingskills/blob/main', b'marketingskills/tree/main', b'marketingskills/raw/main',
               b'raw.githubusercontent.com/coreyhaines31/marketingskills')
    for name in MKT_SKILLS:
        for p in walk_files(os.path.join(CLAUDE, 'skills', name)):
            data = open(p, 'rb').read()
            unpinned += [(rel_claude(p), n.decode()) for n in needles if n in data]
    pinned_links = sum(open(p, 'rb').read().count(MKT_LINK_NEW) for p in pinned)

    # Things that must NOT be there.
    absent = [os.path.join(CLAUDE, 'skills', n) for n in SEO_SKILLS_SKIPPED]
    absent += [os.path.join(CLAUDE, 'agents', n + '.md') for n in SEO_AGENTS_SKIPPED]
    absent += [os.path.join(CLAUDE, 'skills', 'seo', 'scripts', s) for s in SEO_SCRIPTS_EXCLUDED]
    absent += [os.path.join(CLAUDE, 'skills', 'marketing-skill'), os.path.join(CLAUDE, 'skills', 'seo', 'hooks'),
               os.path.join(CLAUDE, 'skills', 'seo', 'extensions')]
    absent += [os.path.join(CLAUDE, 'skills', n, 'evals') for n in MKT_SKILLS]
    problems += ['SHOULD NOT EXIST ' + p for p in absent if os.path.exists(p)]

    print('files compared with staging: %d' % checked)
    print('  identical to audited source: %d' % (checked - len(rewritten) - len(pinned)))
    print('  differ only by the 4 documented placeholder replacements: %d' % len(rewritten))
    print('  differ only by the pinned GitHub links: %d files, %d links at commit %s' % (len(pinned), pinned_links, MKT_COMMIT[:7]))
    print('placeholder name in instruction files: %d reviewed prose line(s), %d UNREVIEWED' % (len(md_ok), len(md_bad)))
    for rel, i, text in md_ok:
        print('   reviewed prose  %s:%d  %s' % (rel, i, text))
    for rel, i, text in md_bad:
        print('   UNREVIEWED      %s:%d  %s' % (rel, i, text))
    print('placeholder name in unmodified audited scripts (by design): %s' % ', '.join('%s x%d' % x for x in code_ok))
    print('unpinned marketingskills references: %d' % len(unpinned))
    for rel, n in unpinned:
        print('   %s -> %s' % (rel, n))
    print('runtime items present in skills/seo: %s' % (sorted(set(runtime_found)) or 'none (setup not run yet)'))
    print('backup items present: %d of %d' % (sum(os.path.exists(b) for o, b in backup_items()), len(backup_items())))
    print('settings.json sha256: %s' % sha(os.path.join(CLAUDE, 'settings.json')))
    if pinned_links != MKT_EXPECTED_LINKS:
        problems.append('PINNED LINK COUNT %d != %d' % (pinned_links, MKT_EXPECTED_LINKS))
    problems += ['UNREVIEWED PLACEHOLDER %s:%d' % (r, i) for r, i, t in md_bad]
    problems += ['UNPINNED %s' % r for r, n in unpinned]
    print('PROBLEMS: %d' % len(problems))
    for p in problems:
        print('   ' + p)
    return 1 if problems else 0


def cmd_plan():
    cmd_backup()
    seo = list(seo_copy_plan())
    mkt = list(mkt_copy_plan())
    md = [s for s, d, k in seo if k == 'md']
    would_rewrite = [s for s in md if rewrite_seo(open(s, 'rb').read()) != open(s, 'rb').read()]
    left = []
    for s, d, k in seo:
        data = open(s, 'rb').read()
        written = rewrite_seo(data) if k == 'md' else data
        if TOKEN in written:
            left.append((s, written.count(TOKEN)))
    links = sum(open(s, 'rb').read().count(MKT_LINK_OLD) for s, d, k in mkt)
    log('== INSTALL plan ==')
    log('  claude-seo: %d files (%d .md, %d would be rewritten); skills %d, agents %d'
        % (len(seo), len(md), len(would_rewrite), len(SEO_SKILLS_NEW), len(SEO_AGENTS_NEW)))
    log('  files that still contain the placeholder name after the 4 replacements: %d' % len(left))
    for s, n in left:
        log('     %s (%d)' % (os.path.relpath(s, SEO_SRC), n))
    log('  marketingskills: %d files; main-branch links to pin: %d' % (len(mkt), links))
    return 0


def main():
    global DRY
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'plan'
    if cmd == 'plan':
        DRY = True
        return cmd_plan()
    if cmd == 'verify':
        return cmd_verify()
    if cmd not in ('backup', 'install'):
        raise SystemExit('unknown command')
    DRY = False
    try:
        (cmd_backup if cmd == 'backup' else cmd_install)()
    finally:
        with open(os.path.join(AUD, 'phase2-log.txt'), 'a', encoding='utf-8') as fh:
            fh.write('--- %s %s ---\n' % (cmd, time.strftime('%Y-%m-%d %H:%M:%S')))
            fh.write('\n'.join(LOG) + '\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
