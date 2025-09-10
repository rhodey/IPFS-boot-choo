# IPFS-boot-choo
IPFS-boot choo.js starter, see:
+ [IPFS-boot](https://github.com/rhodey/IPFS-boot)
+ [lock.host-node](https://github.com/rhodey/lock.host-node)
+ [choo.js](https://github.com/choojs/choo)

## History
This repo was adapted from [choo-animals](https://github.com/louiscenter/choo-animals) and then adapted further to demonstrate IPFS-boot [attestation](https://en.wikipedia.org/wiki/Trusted_Computing#Remote_attestation)
+ Click on the demo link below
+ Load v0.0.4 or later
+ Click "Attestation demo"
+ Target = Prod = lock.host-node

*It might not look like much but the demo demonstrates **true code-as-contract** with an end-to-end trust anchor*

## Build
The aim is reproducible builds so docker is involved
```
docker buildx build --platform=linux/amd64 -t ipfs-boot-choo .
docker run --rm -i --platform=linux/amd64 -v ./dist:/root/dist ipfs-boot-choo
> CIDv0 = QmeT5H5dQ1P3D3Yi4XNTwEJovAkrVeaLtyuauTjSJf7T1p
> CIDv1 = bafybeihpmbawb757arkhnw7qtao5gteksjs2hxjsx3yjha7boldge4zoa4
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
Please if you want to style the bootloader, open a PR ^.^
+ ipfs://bafybeid2eom3gwxknthadjdtywn7zpisteivmgbxtyjctr2pan4flcgnce
+ https://bafybeid2eom3gwxknthadjdtywn7zpisteivmgbxtyjctr2pan4flcgnce.ipfs.dweb.link

## License
MIT
