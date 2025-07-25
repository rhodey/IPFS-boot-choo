# IPFS-boot-choo
IPFS-boot choo.js starter, see:
+ [IPFS-boot](https://github.com/rhodey/IPFS-boot)
+ [choo.js](https://github.com/choojs/choo)

## History
This repo was adapted from [choo-animals](https://github.com/louiscenter/choo-animals). All that differs from standard choo.js is [index.js](https://github.com/rhodey/IPFS-boot-choo/blob/master/src/index.js) knows to unmount

## Build
The aim is reproducible builds so docker is involved
```
docker buildx build --platform=linux/amd64 -t ipfs-boot-choo .
docker run --rm -i --platform=linux/amd64 -v ./dist:/root/dist ipfs-boot-choo
```

## Pin
+ Follow [Pin docs](https://github.com/rhodey/IPFS-boot#pin) in the parent repo
+ You will get container ipfs-pin and .env
```
cp ../IPFS-boot/.env .
CID=$(docker run --rm -i --platform=linux/amd64 -v ./dist:/root/dist --env-file .env ipfs-pin | grep CIDv1 | cut -c9-)
npx ipfs-boot init https://github.com/user/choo123 choo123
npx ipfs-boot publish --cid $CID --version v0.0.1 --notes "release notes"
cat versions.json
```

If you have [just](https://github.com/casey/just) command runner
```
cp ../IPFS-boot/.env .
npx ipfs-boot init https://github.com/user/choo123 choo123
just publish v0.0.1 "release notes"
cat versions.json
```

All that remains is send versions.json to your https server, where the bootloader looks (needs CORS), remember dist/ (your app) is at this point now with IPFS

## Dev
[http://localhost:8080](http://localhost:8080)
```
npm install
npm run dev
```

## Demo
Please if you want to style the [default bootloader](https://github.com/rhodey/IPFS-boot), open a PR ^.^
+ ipfs://bafybeid2phhv7xwnsk7jrvpuc4ufd5zdltax47j64bgusf7iw3aybns5mi
+ https://bafybeid2phhv7xwnsk7jrvpuc4ufd5zdltax47j64bgusf7iw3aybns5mi.ipfs.dweb.link

## License
MIT - Copyright 2025 - mike@rhodey.org
