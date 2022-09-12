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
# add -vx to debug shell execution
.SHELLFLAGS := -eu -o pipefail -c
# disable default rules enabled by default (build yacc, cc and stuff)
MAKEFLAGS += --no-builtin-rules 
# warn if unused variables in use
MAKEFLAGS += --warn-undefined-variables

# always execute targets as a single shell script (i.e. : not line by line) 
.ONESHELL:
# --

NODE_VERSION := $(shell sed -n '/^use-node-version=/ {s///p;q;}' .npmrc)
NODE := node
PNPM := pnpm
ifneq (,$(shell which $(PNPM)))
	$(info pnpm binary found)

	# TODO: adjust NODE and PATH
else ifneq (,$(shell which corepack))
	$(info corepack found)
	# TODO: adjust NODE and PATH
	PNPM := corepack pnpm
	$(shell corepack enable)
else ifneq (,$(shell if [ -d "${HOME}/.nvm/.git" ]; then echo "nvm installed"; fi))
	$(info nvm binary found)
	$(shell source $(HOME)/.nvm/nvm.sh && (test -d $(HOME)/.nvm/versions/node/v$(NODE_VERSION) || nvm install $(NODE_VERSION) 1>/dev/null))
	NODE := $(HOME)/.nvm/versions/node/v$(NODE_VERSION)/bin/node
	# prepend desired node version to PATH environment
	export PATH := $(shell dirname $(NODE)):$(PATH)
	NODE := node
	PNPM := corepack pnpm
	$(shell PATH=$(PATH) corepack enable)
endif

.PHONY: all 
all:
> env | grep $$PATH
>	echo "PNPM=$(PNPM)"
>	echo "NODE=$(NODE)"
> echo "node --version='$$($(NODE) --version)'"
> echo "pnpm --version='$$($(PNPM) --version)'"
> $(PNPM) exec $(SHELL)