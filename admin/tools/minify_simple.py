#!/usr/bin/env python3
"""Simple local minifier for .js and .css files.

This script is intentionally lightweight and avoids external dependencies.
It removes comments and collapses whitespace. It is fast but not a perfect
replacement for production-grade minifiers (it may break some JS edge cases).

Usage:
  python3 tools/minify_simple.py [root_dir]

Created files will have .min.js or .min.css next to the originals.
"""
import os
import re
import sys
from pathlib import Path


def minify_css(text: str) -> str:
    # Remove /* ... */ comments
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    # Remove whitespace around symbols
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s*([{}:;,>+~])\s*", r"\1", text)
    # Trim
    return text.strip()


def minify_js(text: str) -> str:
    # Remove comments but preserve string literals and regex-like literals best-effort.
    out = []
    i = 0
    n = len(text)
    in_s = in_d = in_b = False  # single, double, backtick
    in_sc = in_mc = False  # single-line, multi-line comments
    while i < n:
        c = text[i]
        nc = text[i+1] if i+1 < n else ''
        if in_sc:
            if c == '\n':
                in_sc = False
                out.append(c)
            # else skip
        elif in_mc:
            if c == '*' and nc == '/':
                in_mc = False
                i += 1
            # else skip
        elif in_s:
            out.append(c)
            if c == "'":
                # check not escaped
                # count backslashes before
                j = i-1
                esc = 0
                while j >= 0 and text[j] == '\\':
                    esc += 1
                    j -= 1
                if esc % 2 == 0:
                    in_s = False
        elif in_d:
            out.append(c)
            if c == '"':
                j = i-1
                esc = 0
                while j >= 0 and text[j] == '\\':
                    esc += 1
                    j -= 1
                if esc % 2 == 0:
                    in_d = False
        elif in_b:
            out.append(c)
            if c == '`':
                j = i-1
                esc = 0
                while j >= 0 and text[j] == '\\':
                    esc += 1
                    j -= 1
                if esc % 2 == 0:
                    in_b = False
        else:
            # not in string or comment
            if c == '/' and nc == '/':
                in_sc = True
                i += 1
            elif c == '/' and nc == '*':
                in_mc = True
                i += 1
            elif c == "'":
                in_s = True
                out.append(c)
            elif c == '"':
                in_d = True
                out.append(c)
            elif c == '`':
                in_b = True
                out.append(c)
            else:
                out.append(c)
        i += 1

    s = ''.join(out)
    # Collapse whitespace (but keep single spaces where needed)
    s = re.sub(r"[\t\r\n]+", ' ', s)
    s = re.sub(r" +", ' ', s)
    # Remove space before/after certain punctuation
    s = re.sub(r"\s*([{}=;:,()<>+\-*/%&|!?\[\]])\s*", r"\1", s)
    return s.strip()


def process_file(path: Path):
    text = path.read_text(encoding='utf-8')
    if path.suffix == '.css':
        out = minify_css(text)
        out_path = path.with_suffix('.min.css')
    else:
        out = minify_js(text)
        out_path = path.with_suffix('.min.js')
    out_path.write_text(out, encoding='utf-8')
    return out_path


def main(root_dir: str):
    root = Path(root_dir)
    created = []
    for dp, dn, filenames in os.walk(root):
        # skip node_modules or .git if present
        if 'node_modules' in dp.split(os.sep) or '.git' in dp.split(os.sep):
            continue
        for fn in filenames:
            if fn.endswith('.min.js') or fn.endswith('.min.css'):
                continue
            if fn.endswith('.js') or fn.endswith('.css'):
                full = Path(dp) / fn
                try:
                    out = process_file(full)
                    created.append(str(out))
                    print(f"Created: {out}")
                except Exception as e:
                    print(f"Failed: {full} -> {e}")
    print(f"Done. Created {len(created)} files.")


if __name__ == '__main__':
    if len(sys.argv) > 1:
        root = sys.argv[1]
    else:
        root = os.getcwd()
    main(root)
