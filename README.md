# TV Renamer

A local network app that allows for renaming TV shows

---

## Install

- [Install on FreeNAS with Portainer](docs/FreeNAS.md)

---

## Development

```sh
# Install all deps
npm i

# Start dev server
npm run start:dev
```

Utilizes these API's
- [GitHub](https://developer.github.com/v3/repos)
- [TVDB](https://api.thetvdb.com/swagger)

---

## Build & Run Docker Image

**Prerequisites**
- If running on Windows you may need to go into `Docker > Settings > Shared Drives`
  and enable the drive you want to use a bind-mount with.

```sh
# Run the below only if you haven't been developing in the repo. Otherwise you 
# should already have the necessary modules installed.
npm i
# Compiles the production ready code
npm run build:appForDocker
# Generates test folders/files to validate against. Folder will be mapped via
# a `volume` during `docker-compose`.
npm run gen:files

# Builds the image
docker-compose build

# Run the new image
docker-compose up -d

# Verify the image is up and running. If it's not, you'll see "Exited" in the
# "Status" column.
docker ps -a

# Stops the image and cleans things up
docker-compose down
```

---

## Releasing

You can simply run `./bin/release` and follow the steps. Or go through
everything manually below. To skip having to enter a Docker password every time,
create a `.dockercreds` file at the root of the repo and put your password in
there.

If you choose to go through the manual steps below, you **need** to also go
through the above steps to ensure the image is built correctly.

```sh
# log in (so the image can be pushed)
docker login -u=<USER> -p=<PASSWORD>
# get the id of the latest build
docker images
# tag the image
docker tag <CONTAINER_ID> theonewhoknocks/tv-renamer:v<SEM_VER>
# push up the image
docker push theonewhoknocks/tv-renamer:v<SEM_VER>
```
