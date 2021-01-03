#!/bin/sh

CONTAINER="tvrenamer_dev"

alias starttvrenamer="docker-compose up -d ${CONTAINER} & sleep 2 && docker exec -it ${CONTAINER} zsh && docker-compose down"
alias entertvrenamer="docker-compose exec ${CONTAINER} zsh"
