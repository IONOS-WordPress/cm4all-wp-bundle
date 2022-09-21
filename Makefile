#!/usr/bin/env make

# make output less verbose
# MAKEFLAGS += --silent

# ensure make is supporting .RECIPEPREFIX
ifeq ($(origin .RECIPEPREFIX), undefined)
  $(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
# make to use > as the block character
.RECIPEPREFIX = >

# alwas use bash as shell (to get <<< and stuff working), otherwise sh would be used by default
SHELL := $(shell which bash)
# use bash strict mode o that make will fail if a bash statement fails
.SHELLFLAGS := -eu -o pipefail -c
# debug make shell execution
#.SHELLFLAGS += -vx

# disable default rules enabled by default (build yacc, cc and stuff)
MAKEFLAGS += --no-builtin-rules 
# warn if unused variables in use
MAKEFLAGS += --warn-undefined-variables
# suppress "make[2]: Entering directory" messages
MAKEFLAGS += --no-print-directory

# always execute targets as a single shell script (i.e. : not line by line) 
.ONESHELL:

# make all the default target
.DEFAULT_GOAL := all
# --

# ensure pnpm is available
ifeq (,$(shell which pnpm))
	define PNPM_NOT_FOUND
pnpm is not installed or not in PATH. 
Install it using "wget -qO- 'https://get.pnpm.io/install.sh' | sh -"
(windows : 'iwr https://get.pnpm.io/install.ps1 -useb | iex') 

See more here : https://docs.npmjs.com/getting-started/installing-node 
	endef
	$(error $(PNPM_NOT_FOUND))
endif

# ensure a recent nodejs version is available
ifeq (,$(shell which nodejs))
	define NODEJS_NOT_FOUND
node is not installed or not in PATH. 
See more here : https://nodejs.org/en/download/ 
	endef
	$(error $(NODEJS_NOT_FOUND))
endif

PNPM != which pnpm
# disable PNPM update notifier
export NO_UPDATE_NOTIFIER=1

NODE_VERSION != sed -n '/^use-node-version=/ {s///p;q;}' .npmrc
NODE := $(HOME)/.local/share/pnpm/nodejs/$(NODE_VERSION)/bin/node 
ESBUILD := node_modules/.bin/esbuild

# this target triggers pnpm to download/install the required nodejs if not yet available 
$(NODE):
> @$(PNPM) exec node --version 1&>/dev/null
> touch -m $@

pnpm-lock.yaml: package.json 
>	$(PNPM) install --lockfile-only
> @touch -m pnpm-lock.yaml

node_modules: pnpm-lock.yaml 
# pnpm bug: "pnpm use env ..." is actually not needed but postinall npx calls fails
> pnpm env use --global $(NODE_VERSION)

>	$(PNPM) install --frozen-lockfile
> @touch -m node_modules 

.PHONY: build 
#HELP: * build artifacts
build: node_modules $(NODE)

test/fixtures/wordpress/build/gutenberg-stub.js : test/fixtures/wordpress/gutenberg-stub.js node_modules 
> $(ESBUILD) $< --bundle --target=esnext --global-name=wp --loader:.js=jsx --define:global=window --define:process.env.NODE_ENV=\"development\" --define:process.env.IS_GUTENBERG_PLUGIN=true --outfile=$@
> touch -m $@

.PHONY: test 
#HELP: * executes the tests
test: node_modules $(NODE) test/fixtures/wordpress/build/gutenberg-stub.js
> $(PNPM) test

.PHONY: clean
#HELP: * clean up intermediate files
clean:
# remove everything matching .gitignore entries (-f is force, you can add -q to suppress command output, exclude node_modules and node_modules/**)
#   => If an untracked directory is managed by a different git repository, it is not removed by default. Use -f option twice if you really want to remove such a directory.
> git clean -Xfd -e '!/*.env' -e '!/*.code-workspace' -e '!**/node_modules' -e '!**/node_modules/**' 

.PHONY: all
#HELP: * build the project
all: build
> env | grep $$PATH
>	echo "PNPM=$(PNPM)"
>	echo "NODE=$(NODE)"
> echo "node --version='$$($(NODE) --version)'"
> echo "pnpm --version='$$($(PNPM) --version)'"

# delete all files in the current directory (or created by this makefile) that are created by configuring or building the program.
# see https://www.gnu.org/software/make/manual/html_node/Standard-Targets.html 
.PHONY: distclean
#HELP: * cleanup installed software artifacts
distclean: clean
> git clean -Xfd -e '!/*.env' -e '!/*.code-workspace'
> rm pnpm-lock.yaml
# uninstall nodejs version via nodejs
> test -f $(NODE) && $(PNPM) env remove --global $(NODE_VERSION) ||:

# see https://gist.github.com/Olshansk/689fc2dee28a44397c6e31a0776ede30
.PHONY: help
#HELP: * prints this screen
help: 
> @printf "Available targets\n\n"
> @awk '/^[a-zA-Z\-_0-9]+:/ { 
>   helpMessage = match(lastLine, /^#HELP: (.*)/); 
>   if (helpMessage) { 
>     helpCommand = substr($$1, 0, index($$1, ":")-1); 
>     helpMessage = substr(lastLine, RSTART + 6, RLENGTH); 
>     gsub(/\\n/, "\n", helpMessage);
>     printf "\033[36m%-30s\033[0m %s\n", helpCommand, helpMessage;
>   } 
> } 
> { lastLine = $$0 }' $(MAKEFILE_LIST)