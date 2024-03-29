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
SHELL != which bash
# use bash strict mode o that make will fail if a bash statement fails
.SHELLFLAGS := -eu -o pipefail -c
# debug make shell execution
#.SHELLFLAGS += -vx

# disable default rules enabled by default (build yacc, cc and stuff)
MAKEFLAGS += --no-builtin-rules 
# warn if unused variables in use
MAKEFLAGS += --warn-undefined-variables
# # suppress "make[2]: Entering directory" messages
# MAKEFLAGS += --no-print-directory

# always execute targets as a single shell script (i.e. : not line by line) 
.ONESHELL:

.DEFAULT_GOAL := help
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
# export NO_UPDATE_NOTIFIER=1

NODE_VERSION != sed -n '/^use-node-version=/ {s///p;q;}' .npmrc
NODE := $(HOME)/.local/share/pnpm/nodejs/$(NODE_VERSION)/bin/node 
ESBUILD := pnpm exec esbuild

DOCKER_IMAGE := lgersman/$(shell jq -r '.name | values' package.json)

# this target triggers pnpm to download/install the required nodejs if not yet available 
$(NODE):
# > @$(PNPM) exec node --version 1&>/dev/null
# > touch -m $@

pnpm-lock.yaml: package.json 
>	$(PNPM) install --lockfile-only
> @touch -m pnpm-lock.yaml

node_modules: pnpm-lock.yaml 
# pnpm bug: "pnpm use env ..." is actually not needed but postinall npx calls fails
> $(PNPM) env use --global $(NODE_VERSION)
>	$(PNPM) install --frozen-lockfile
> @touch -m node_modules 

# package-lock.json: $(NODE)
# # npm install call will fail if node_modules are installed by pnpm 
# > rm -rf ./node_modules
# # npm install 
# > pnpm exec npm install --no-fund --package-lock-only --omit=dev --omit=optional --omit=peer --force
# > touch -m package-lock.json

.PHONY: build 
#HELP: * build artifacts
build: node_modules $(NODE)

docker/%.tgz : $(src/%) package.json LICENSE.md README.md 
# delete older tgz files to prevent adding them to the docker image (see Dockerfile)
> rm -f ./docker/*.tgz
# unfortunately we cannot use pnpm deploy since this action requires pnpm workspaces enabled 
# > TGZ=$$($(PNPM) pack --pack-destination ./docker) && tar -xvf ./docker/$$TGZ --directory ./docker
> $(PNPM) pack --pack-destination ./docker
# > cd ./docker
# > rm $$TGZ
# > touch -m ./package 

.PHONY: npm-publish
#HELP: * publish package to npm regisry
npm-publish: #test
# bash does not allow declaring env variables containing "/" 
> env "npm_config_//registry.npmjs.org/:_authtoken=$(NPM_TOKEN)" $(SHELL) -c 'env | grep npm_ && pnpm publish --no-git-checks --report-summary'
# > pnpm publish --no-git-checks --report-summary
# NODE_AUTH_TOKEN

.PHONY: docker-image
#HELP: * build docker image
docker-image: package.json docker/%.tgz .npmrc
> PACKAGE_VERSION=$$(jq -r '.version | values' package.json)
> PACKAGE_AUTHOR="$$(jq -r '.author.name | values' package.json) <$$(jq -r '.author.email | values' package.json)>"
> NODEJS_VERSION=$$(grep -oP 'use-node-version=\K.*' .npmrc)
# value can be alpine|bullseye|bullseye-slim
> LINUX_DIST=bullseye-slim
> export DOCKER_SCAN_SUGGEST=false 
> export DOCKER_BUILDKIT=1
# image labels : see https://github.com/opencontainers/image-spec/blob/main/annotations.md#pre-defined-annotation-keys
> docker build \
>		--no-cache \
> 	--progress=plain \
> 	--build-arg nodejs_base=$$NODEJS_VERSION-$$LINUX_DIST \
>		-t $(DOCKER_IMAGE):latest \
> 	-t $(DOCKER_IMAGE):$$PACKAGE_VERSION \
>		--label "maintainer=$$PACKAGE_AUTHOR" \
> 	--label "org.opencontainers.image.title=$(DOCKER_IMAGE)" \
> 	--label "org.opencontainers.image.description=$$(jq -r '.description | values' package.json)" \
> 	--label "org.opencontainers.image.authors=$$PACKAGE_AUTHOR" \
>		--label "org.opencontainers.image.source=$$(jq -r '.repository.url | values' package.json)" \
> 	--label "org.opencontainers.image.url=$$(jq -r '.homepage | values' package.json)" \
> 	--label "org.opencontainers.image.vendor=https://cm4all.com" \
> 	--label "org.opencontainers.image.licenses=$$(jq -r '.license | values' package.json)" \
> 	-f ./docker/Dockerfile .
# output generated image labels
# > docker image inspect --format='' $(DOCKER_IMAGE):latest 2> /dev/null | jq '.[0].Config.Labels'
> docker image inspect --format='' $(DOCKER_IMAGE):latest | jq '.[0].Config.Labels | values'
# output some image statistics
> docker image ls $(DOCKER_IMAGE):$$PACKAGE_VERSION

.PHONY: docker-image-push
#HELP: * push docker image to docker hub\n  (docker login using token or password required before)
docker-image-push: docker-image 
> echo "$$DOCKER_TOKEN" | docker login --username "$$DOCKER_USER" --password-stdin
> docker push $(DOCKER_IMAGE):latest
> docker push $(DOCKER_IMAGE):$$(jq -r '.version | values' package.json)

.PHONY: docker-image-deploy
#HELP: * update README and description of docker image at docker hub
docker-image-deploy: docker-image-push
# > cat ~/my_password.txt | docker login --username foo --password-stdin
# > docker login --username='$(DOCKER_USER)' --password='$(DOCKER_TOKEN)' $${DOCKER_HOST:-}
> LOGIN_PAYLOAD=$$(printf '{"username": "%s", "password": "%s" }' "$$DOCKER_USER" "$$DOCKER_TOKEN")
> TOKEN=$$(curl -s --show-error  -H "Content-Type: application/json" -X POST -d "$$LOGIN_PAYLOAD" https://hub.docker.com/v2/users/login/ | jq --exit-status -r .token)
# GET : > curl -v -H "Authorization: JWT $${TOKEN}" "https://hub.docker.com/v2/repositories/$(DOCKER_IMAGE)/"
> DESCRIPTION=$$(docker image inspect --format='' $(DOCKER_IMAGE):latest | jq -r '.[0].Config.Labels["org.opencontainers.image.description"] | values')
# see https://frontbackend.com/linux/how-to-post-a-json-data-using-curl
# see https://stackoverflow.com/a/48470227/1554103
> jq -n \
>   --arg description "$$DESCRIPTION" \
>   --arg full_description "$$(<./docker/README.md)" \
> 	'{description: $$description, full_description: $$full_description}' \
>	| curl -s --show-error \
> 	-H "Content-Type: application/json" \
>		-H "Authorization: JWT $${TOKEN}" \
> 	-X PATCH \
>		--data-binary @- \
> 	"https://hub.docker.com/v2/repositories/$(DOCKER_IMAGE)/" \
> | jq .


.PHONY: docker-run
#HELP: start docker container with bash as entrypoint
docker-run: docker
> docker run -it --rm --mount type=bind,source=/home/lgersman/workspace/cm4all-wp-impex,target=/app --entrypoint=bash $(DOCKER_IMAGE):latest

.PHONY: lint
#HELP: * lint sources
lint: node_modules
> pnpm prettier --ignore-unknown --check .
> pnpm eslint --no-error-on-unmatched-pattern .

.PHONY: lint-fix
#HELP: * lint sources and fix them where possible
lint-fix: node_modules
> pnpm prettier --check --write .
> pnpm eslint --no-error-on-unmatched-pattern --fix .

SCRIPT_SOURCES := $(wildcard /home/lgersman/workspace/cm4all-wp-impex/plugins/cm4all-wp-impex/src/*.mjs)
SCRIPT_TARGETS := $(subst /src/,/dist/,$(SCRIPT_SOURCES:.mjs=.js))

.PHONY: impex-js
impex-js : $(SCRIPT_TARGETS)

/home/lgersman/workspace/cm4all-wp-impex/plugins/cm4all-wp-impex/dist/%.js : /home/lgersman/workspace/cm4all-wp-impex/plugins/cm4all-wp-impex/src/%.mjs
> $(eval $@_GLOBAL_NAME := $(basename $(notdir $@)))
> cat << EOF | docker run -i --rm --mount type=bind,source=/home/lgersman/workspace/cm4all-wp-impex,target=/app $(DOCKER_IMAGE):latest --analyze --global-name='$($@_GLOBAL_NAME)' --mode=development --outdir=plugins/cm4all-wp-impex/dist $(patsubst /home/lgersman/workspace/cm4all-wp-impex/%,%, $<)
> { 
>	  "wordpress" : { 
>      "mappings" : { 
>        "@cm4all-impex/debug" : "wp.impex.debug", 
>        "@cm4all-impex/store" : "wp.impex.store",
>        "@cm4all-impex/filters" : "wp.impex.filters", 
>        "React": "window.React" 
>      }
>   }
# >   ,
# >		"esbuild" : {
# >     "loader" : {
# > 			".foo": "jsx"
# > 	  }
# >   }
>	}
> EOF
# > echo '{ "wordpress" : { "mappings" : { "@cm4all-impex/debug" : "wp.impex.debug", "@cm4all-impex/store" : "wp.impex.store", "@cm4all-impex/filters" : "wp.impex.filters", "React": "window.React" } }}' | docker run -i --rm -v /home/lgersman/workspace/cm4all-wp-impex:/app $(DOCKER_IMAGE):latest --verbose --global-name='$($@_GLOBAL_NAME)' --mode=development --outdir=plugins/cm4all-wp-impex/dist $(patsubst /home/lgersman/workspace/cm4all-wp-impex/%,%, $<)

test/fixtures/wordpress/build/gutenberg-stub.js : test/fixtures/wordpress/gutenberg-stub.js node_modules 
> $(ESBUILD) $< --bundle --analyze --metafile=meta.json --target=esnext --global-name=wp --loader:.js=jsx --define:global=window --define:process.env.NODE_ENV=\"development\" --define:process.env.IS_GUTENBERG_PLUGIN=true --outfile=$@
> touch -m $<

.PHONY: test 
#HELP: * run test suite
test: node_modules $(NODE) test/fixtures/wordpress/build/gutenberg-stub.js
> $(PNPM) test

.PHONY: clean
#HELP: * clean up intermediate files
clean:
# remove everything matching .gitignore entries (-f is force, you can add -q to suppress command output, exclude node_modules and node_modules/**)
#   => If an untracked directory is managed by a different git repository, it is not removed by default. Use -f option twice if you really want to remove such a directory.
> git clean -Xfd -e '!/*.env' -e '!/*.code-workspace' -e '!**/node_modules' -e '!**/node_modules/**' 
> docker image rm $$(docker images -q $(DOCKER_IMAGE)) 2>/dev/null || true

# .PHONY: all
# #HELP: * build the project
# all: build
# > env | grep $$PATH
# >	echo "PNPM=$(PNPM)"
# >	echo "NODE=$(NODE)"
# > echo "node --version='$$($(NODE) --version)'"
# > echo "pnpm --version='$$($(PNPM) --version)'"

# delete all files in the current directory (or created by this makefile) that are created by configuring or building the program.
# see https://www.gnu.org/software/make/manual/html_node/Standard-Targets.html 
.PHONY: distclean
#HELP: * cleanup installed software artifacts
distclean: clean
> git clean -Xfd -e '!/*.env' -e '!/*.code-workspace'
> rm pnpm-lock.yaml
# uninstall nodejs version via nodejs
> test -f $(NODE) && $(PNPM) env remove --global $(NODE_VERSION) ||:

.PHONY: update 
#HELP: * update dependencies interactively
update: 
> $(PNPM) update --latest --interactive


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