#!/bin/sh

CONTAINER="tvrenamer_dev"

# related to WSL2: https://github.com/microsoft/WSL/issues/4739
WSL2_ENV_VARS=""
if [[ "${WSL_INTEROP}" != "" ]]; then
  WSL2_ENV_VARS="-e WSL_INTEROP=\"${WSL_INTEROP}\" -e CHOKIDAR_USEPOLLING=1"
fi

# TODO - create a check script that verifies the container is up instead of using sleep
# https://stackoverflow.com/a/57536744/5156659

alias starttvrenamer="docker-compose up -d ${CONTAINER} & sleep 4 && docker exec ${WSL2_ENV_VARS} -it ${CONTAINER} zsh && docker-compose down"
alias entertvrenamer="docker-compose exec ${CONTAINER} zsh"
