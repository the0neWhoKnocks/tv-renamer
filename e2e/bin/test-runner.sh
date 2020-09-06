#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"
[[ "$1" == "watch" ]] && WATCH_MODE=true || WATCH_MODE=false
[[ "$2" == "--skip-build" ]] && BUILD=false || BUILD=true

isWSL=false
isOSX=false

# Linux env
if [ -f "/proc/version" ]; then
  grep -qE "(Microsoft|WSL)" /proc/version && isWSL=true || isWSL=false
else
  isOSX=$(uname | grep -qi "darwin" &> /dev/null)
fi

TEST_FOLDER="./e2e"
PATH_01=("${TEST_FOLDER}/cypress.json" "{ \"video\": false }\n")
PATH_02=("${TEST_FOLDER}/cypress/integration")
PATH_03=("${TEST_FOLDER}/cypress/integration/example.test.js" "context('Example', () => {\n  beforeEach(() => { cy.visit('/'); });\n\n  it('should have loaded', () => {\n    cy.get('title').contains(/.*/);\n  });\n});\n")
scaffold=(PATH_01[@] PATH_02[@] PATH_03[@])
if [ ! -f "${!scaffold[0]:0:1}" ]; then
  echo "[SCAFFOLD] Cypress test directory"
  
  length=${#scaffold[@]}
  for ((i=0; i<$length; i++)); do
    path="${!scaffold[i]:0:1}"
    contents="${!scaffold[i]:1:1}"
    
    if [[ "${contents}" != "" ]]; then printf "${contents}" > "${path}"; else mkdir -p "${path}"; fi
  done
fi

E2E_SERVICE="e2e-cypress"
cypressCmd=""
xlaunchPath="${SCRIPT_DIR}/XServer.xlaunch"

# When watching for test changes, `open` (instead of `run`) Cypress so that the
# Dev can use the GUI for an easy test writing experience.
if $WATCH_MODE; then
  if $isWSL; then
    display="$(hostname):0.0"
    xlaunchBinary="/c/Program Files/VcXsrv/xlaunch.exe"
    xlaunchPath=$(wslpath -w "${SCRIPT_DIR}/XServer.xlaunch")
    xlaunchKillCmd="/c/Windows/System32/taskkill.exe /IM \"vcxsrv.exe\" /F"
    /c/Windows/System32/tasklist.exe | grep -q vcxsrv && SERVER_IS_RUNNING=true || SERVER_IS_RUNNING=false
    
    # If previous Server session wasn't terminated, kill it
    if $SERVER_IS_RUNNING; then
      echo;
      echo "[KILL] Previously running XServer session"
      eval "$xlaunchKillCmd"
    fi
  elif $isOSX; then
    xquartzBinary=$(which xquartz)
    xquartzKillCmd="osascript -e 'quit app \"xquartz\"'"
    IP=$(ifconfig en0 | grep inet | awk '$1=="inet" {print $2}')
    display="$IP:0"
  fi

  if [[ "$display" != "" ]]; then
    cypressCmd="docker-compose run -e DISPLAY=$display --entrypoint cypress ${E2E_SERVICE} open --project ."
    
    if [[ "$xlaunchBinary" != "" ]] && [ -f "$xlaunchBinary" ]; then
      echo;
      echo "[START] XServer"
      "$xlaunchBinary" -run "$xlaunchPath"
    elif [[ "$xquartzBinary" != "" ]] && [ -f "$xquartzBinary" ]; then
      echo;
      echo "[START] XServer"
      xhost + $IP
    else
      echo "[ERROR] The XServer binary could not be located. Follow the instructions in the README to get it installed."
      echo;
      exit 1
    fi
  else
    echo;
    echo "[ERROR] You're trying to run watch mode but no \`DISPLAY\` was set for your OS, and one could not be determined."
    echo;
    exit 1
  fi
fi

if $BUILD; then
  echo;
  echo "[BUILD] App"
  npm run build:appForDocker
fi

echo;
echo "[CREATE] Mock files and folders"
npm run gen:files

echo;
echo "[START] Tests"
echo;
$BUILD && BUILD_FLAG="--build" || BUILD_FLAG=""
DOCKER_COMPOSE_UP_CMD="docker-compose up ${BUILD_FLAG} --abort-on-container-exit"
if [[ "$cypressCmd" != "" ]]; then
  npx concurrently --kill-others -p "[ {name} ]" -n APP,TESTS -c black.bgGreen,black.bgCyan "${DOCKER_COMPOSE_UP_CMD} tv-renamer" "${cypressCmd}"
else
  ${DOCKER_COMPOSE_UP_CMD}
fi

if [[ "$xlaunchKillCmd" != "" ]]; then
  echo;
  echo "[KILL] XServer"
  eval "$xlaunchKillCmd"
elif [[ "$xquartzKillCmd" != "" ]]; then
  echo;
  echo "[KILL] XServer"
  eval "$xquartzKillCmd"
fi
