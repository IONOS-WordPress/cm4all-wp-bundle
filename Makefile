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
SHELL := bash
# use bash strict mode o that make will fail if a bash statement fails
.SHELLFLAGS := -eu -o pipefail -c
# disable default rules enabled by default (build yacc, cc and stuff)
MAKEFLAGS += --no-builtin-rules 
# warn if unused variables in use
MAKEFLAGS += --warn-undefined-variables

# always execute targets as a single shell script (i.e. : not line by line) 
.ONESHELL:
# --

PNPM := pnpm
ifneq (,$(shell which $(PNPM)))
	$(info "pnpm binary found")
else ifneq (,$(shell which corepack))
	$(info "corepack found")
	PNPM := corepack pnpm
else ifneq (,$(shell if [ -d "${HOME}/.nvm/.git" ]; then echo "nvm installed"; fi))
	$(info "nvm binary found")
	$(shell source $(HOME)/.nvm/nvm.sh && nvm install v16.13 && $(MAKE) $(MAKECMDGOALS))
	# MAKECMDGOALS=bar
else 
	$(info "dont know how to aquire pnpm")
endif



foo:
	$(info "PNPM=${PNPM}")
	$(info "${MAKE} ${MAKEFLAGS} ${MAKEOVERRIDES} ${MFLAGS} ${GNUMAKEFLAGS} ${MAKECMDGOALS}")
