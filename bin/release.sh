#!/bin/bash

function handleError {
  if [ $1 -ne 0 ]; then
    echo;
    echo "[ ERROR ] $2"
    exit $1
  fi
}

# give options for skipping bump, or 3 bump options
echo "[ BUMP ] versions ========================"
# get current version number
VERSION=$(node -pe "require('./package.json').version")
REPO_URL=$(git config --get remote.origin.url)
REPO_URL=$(node -p "'$REPO_URL'.replace(/^git@/,'https://').replace('.com:','.com/').replace(/\.git$/,'')")

# build out what the version would be based on what the user chooses
MAJOR=$(node -p "var nums='$VERSION'.split('.'); nums[0]=+nums[0]+1; nums[1]=0; nums[2]=0; nums.join('.')")
MINOR=$(node -p "var nums='$VERSION'.split('.'); nums[1]=+nums[1]+1; nums[2]=0; nums.join('.')")
PATCH=$(node -p "var nums='$VERSION'.split('.'); nums[2]=+nums[2]+1; nums.join('.')")

# Allows for reading input below during actual git call - assigns stdin to keyboard
exec < /dev/tty

echo;
echo " Choose what version to bump to"
echo;
echo " (1) Patch - $PATCH"
echo " (2) Minor - $MINOR"
echo " (3) Major - $MAJOR"
echo " (4) Don't bump the version"
echo;

read selectedOption

case $selectedOption in
  1)
    bump="patch"
    newVersion="$PATCH"
    ;;
  2)
    bump="minor"
    newVersion="$MINOR"
    ;;
  3)
    bump="major"
    newVersion="$MAJOR"
    ;;
esac
# close stdin
exec <&-

echo;
if [[ "$bump" != "" ]]; then
  # ensure tags are up to date
  git fetch --tags
  
  # get previous tag info so that the changelog can be updated.
  if [[ $(git tag -l) != "" ]]; then
    latestTag=$(git tag -l | tail -n1)
    #echo "Latest tag: $latestTag"
  fi

  # get a list of changes between tags
  if [[ "$latestTag" != "" ]]; then
    filename="./CHANGELOG.md"
    newContent=""
    touch "$filename"

    #changes=$(git log "v3.1.0".."v4.0.0" --oneline)
    changes=$(git log "$latestTag"..HEAD --oneline)
    formattedChanges=""
    while read -r line; do
      if [[ "$formattedChanges" != "" ]]; then
        formattedChanges="$formattedChanges,'$line'"
      else
        formattedChanges="'$line'"
      fi
    done < <(echo -e "$changes")
    formattedChanges="[$formattedChanges]"

    newContent=$(node -pe "
      let changes = $formattedChanges;
      for(let i=0; i<changes.length; i++){
        changes[i] = changes[i].replace(/^([a-z0-9]+)\s/i, \"- [\$1]($REPO_URL/commit/\$1) \");
      }
      changes.join('\n');
    ")

    # add changes to top of logs
    originalLog=$(cat "$filename")
    if [[ "$newContent" != "" ]]; then
      changelog=""
      lineNum=0
      while read line; do
        if [ $lineNum != 0 ]; then changelog+=$'\n'; fi;
        
        changelog+="$line"
        lineNum+=1
        
        # find the line just under the header text
        if [ "$changelog" = "# Changelog"$'\n'"---" ]; then
          # append the new changes
          change=$'\n'"## v$newVersion"$'\n\n'"$newContent"
          changelog="$changelog"$'\n'"$change"$'\n\n'"---"
        fi;
      done < $filename
      
      echo "$changelog" > "$filename"
    fi
  fi
  
  npm version --no-git-tag-version $bump
  handleError $? "Couldn't bump version number."
  
  echo;
  echo "[ COMPILE ] code ========================="
  echo;
  npm run build:appForDocker
  handleError $? "Couldn't compile with new version."
  
  echo;
  echo "[ BUILD ] Docker Image ========================="
  echo;
  docker-compose build
  handleError $? "Couldn't build Docker image"
  
  echo;
  echo "[ START ] Docker Image ========================="
  echo;
  # Run the new image
  docker-compose up -d
  handleError $? "Couldn't start Docker image"
  
  exec < /dev/tty
  echo;
  echo " Verify things are running properly at http://localhost:9000"
  echo;
  echo " (1) Continue"
  echo " (2) Abort"
  echo;
  
  read response
  
  case $response in
    1)
      continueRelease="true"
      ;;
  esac
  exec <&-
  
  # Stops the image and cleans things up
  docker-compose down
  
  if [[ "$continueRelease" != "" ]]; then
    DOCKER_USER = "theonewhoknocks"
    DOCKER_PASS = $(cat .dockercreds 2> /dev/null)
    APP_NAME = "tv-renamer"
    LATEST_ID = $(docker images | grep -E "$APP_NAME.*latest" | awk -e '{print $3}')
    
    # log in (so the image can be pushed)
    docker login -u=$DOCKER_USER -p=$DOCKER_PASS
    handleError $? "Couldn't log in to Docker"
    # add and commit relevant changes
    git add CHANGELOG.md package.json package-lock.json
    git commit -m "Bump to v$newVersion"
    # tag all the things
    git tag -a "v$newVersion" -m "v$newVersion"$'\n\n'"$changes"
    docker tag $LATEST_ID "$DOCKER_USER/$APP_NAME:v$newVersion"
    # push up the tags
    git push --follow-tags
    docker push $DOCKER_USER/$APP_NAME:v$newVersion
  else
    # reset changelog
    echo "$originalLog" > "$filename"
    # reset version bump
    npm version --no-git-tag-version $VERSION
  fi
fi