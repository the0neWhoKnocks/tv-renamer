# TV Renamer

A local network app that allows for renaming TV shows

---

## Install

```sh
yarn add @noxx/tv-renamer
# or
npm i @noxx/tv-renamer
```

---

## Usage

---

## Development

```sh
# Install all deps
yarn
# or
npm i

# Start dev server
yarn start:dev
# or
npm run start:dev
```

Utilizes these API's
- [GitHub](https://developer.github.com/v3/repos)
- [TVDB](https://api.thetvdb.com/swagger)

#### Troubleshooting

**App doesn't start on same port**
Sometimes a process hangs and a zombie `node` process is locking the expected
port, so just run `pkill -9 node` to kill all `node` processes.
