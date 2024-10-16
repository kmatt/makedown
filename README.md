# `makedown` = A `Markdown` based `Makefile` alternative

`makedown` is a versatile CLI tool that lets you execute shell scripts,
JavaScript code, Python code, or any other script defined in one or more markdown files.

It's a streamlined alternative to `Makefile`, `package.json` or scattered shell scripts,
and it features built-in syntax highlighting through markdown code blocks and
allows documenting commands in a human-friendly format.

## Key Features

- Multilingual Execution: Supports Zsh, JavaScript, and Python.
- Simplified Scripting: Use markdown files (.md) to organize and run commands.
- Syntax Highlighting: Leverages markdown code blocks for readability.
- Autocomplete Support: ZSH completions for a smoother workflow.
- Support triple backtick code blocks.

## Installation

```bash
pip install makedown
```

## Usage

Define and document your commands in a markdown file, like in [DEMO.md](./DEMO.md).

Then use `makedown` to run them, from within the same directory or any subdirectory.

```bash
$ makedown --help # Prints help with available commands
$ makedown # Also prints help

$ makedown my_command # Runs the command
$ makedown my_command arg1 arg2 # Pass arguments to the command
$ makedown my_command --help # Prints help for the command
```

## Development

These are actually `makedown` commands.

### [dev:venv:create]() Creates a virtual environment.

```bash
python3 -m venv venv
```

### Activate the virtual environment.

```bash
source venv/bin/activate
```

### [dev:install]() Installs python dependencies.

```bash
pip install setuptools wheel twine
```

### [dev:build]() Builds the package.

```bash
python setup.py sdist bdist_wheel
```

### [dev:publish]() Publishes the package to pypi.

```bash
twine upload dist/*
```
