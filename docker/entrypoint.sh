#!/bin/bash

set -e

# ensure stdin is provided using docker -i argument
if ls -Ll /proc/self/fd/0 | grep -q ' 1,  *3 '; then
  echo "container has no access to stdin. Run 'docker run -i ...' to run the container with stdin enabled"
  exit 1
fi

# ensure mount point /app bound to host repo directory using docker --mount argument
if [[ ! -d /app ]]; then
  echo "mount point '/app' is not bound to a host directory. Run 'docker ... --mount type=bind,source=<host-repo-directory>,target=/app ...'"
  exit 1
fi 

cd /app && /usr/bin/env -S NODE_NO_WARNINGS=1 NODE_PATH=/app/node_modules node $(which wp-esbuild-bundle-cli) $@