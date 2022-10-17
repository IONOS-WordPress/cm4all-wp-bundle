#!/bin/bash

set -e

# TODO: test container started interactive
# TODO: test container /app is mounted
# if [ ! -t 1 ] ; then
#   echo "container has no access to stdin. run 'docker run -i ...' to run the container with stdin enabled"
#   exit 1
# fi

/usr/bin/env -S NODE_NO_WARNINGS=1 node $(which wp-esbuild-bundle-cli) $@