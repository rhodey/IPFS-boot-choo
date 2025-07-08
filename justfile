sudo := "$(docker info > /dev/null 2>&1 || echo 'sudo')"

build:
    {{sudo}} docker buildx build --platform=linux/amd64 -t ipfs-boot-choo .
    {{sudo}} docker run --rm -i --platform=linux/amd64 -v ./dist:/root/dist ipfs-boot-choo

pin:
    {{sudo}} docker run --rm -i --platform=linux/amd64 -v /tmp/w3access:/root/.config/w3access -v ./dist:/root/dist --env-file .env ipfs-pin

CID := "$(just pin | grep CIDv1 | cut -c9-)"

publish v n:
    npx ipfs-boot publish --cid {{CID}} --version "{{v}}" --notes "{{n}}"
