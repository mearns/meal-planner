#!/usr/bin/env sh

rsync -r \
    --exclude=.git \
    --exclude=node_modules/ \
    --exclude=reports/ \
    --exclude=public/ \
    --exclude=copy-template.sh \
    . "$1"
