#!/usr/bin/env bash

if [ "$1" = "" ]
then
  echo "Please provide a directory path."
  exit 1;
fi

RANKING="../ranking/bin/cli.js"

OPTIONS_DANCER_1VS1="-p 1 -f -j"
OPTIONS_DANCER_2VS2="-p 2 -f -j"
OPTIONS_DANCER_COMBINED="-f -j"

DIR=$1/$(date +%Y-%m-%d);

mkdir $DIR

$RANKING $OPTIONS_DANCER_1VS1 > $DIR/dancer-1vs1.jsonld
$RANKING $OPTIONS_DANCER_2VS2 > $DIR/dancer-2vs2.jsonld
$RANKING $OPTIONS_DANCER_COMBINED > $DIR/dancer-combined.jsonld
