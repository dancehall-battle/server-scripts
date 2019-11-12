#!/usr/bin/env bash

ROOTDIR=$1
LDFSERVERID=$2
CONFIG=$3
DATASOURCE=$4

if [ "$ROOTDIR" = "" ]
then
  echo "Please provide a directory path."
  exit 1;
fi

RANKING="../ranking/bin/cli.js"
UPDATECONFIG="node ../ranking/scripts/update-ldf-config.js -c $CONFIG -d $DATASOURCE -f "

OPTIONS_DANCER_1VS1="-p 1 -f -j"
OPTIONS_DANCER_2VS2="-p 2 -f -j"
OPTIONS_DANCER_COMBINED="-f -j"
OPTIONS_COUNTRY_BOTH="-r country -j"
OPTIONS_COUNTRY_HOME="-r country -h -j"
OPTIONS_COUNTRY_AWAY="-r country -a -j -c"

TODAY=$(date +%Y-%m-%d);
DIR=$ROOTDIR/$TODAY;

mkdir $DIR

# Generate rankings for dancers
$RANKING $OPTIONS_DANCER_1VS1 > $DIR/dancer-1vs1.jsonld
$UPDATECONFIG $DIR/dancer-1vs1.jsonld -t "$TODAY-dancer-1vs1" > temp.jsonld
mv temp.jsonld $CONFIG

$RANKING $OPTIONS_DANCER_2VS2 > $DIR/dancer-2vs2.jsonld
$UPDATECONFIG $DIR/dancer-2vs2.jsonld -t "$TODAY-dancer-2vs2" > temp.jsonld
mv temp.jsonld $CONFIG

$RANKING $OPTIONS_DANCER_COMBINED > $DIR/dancer-combined.jsonld
$UPDATECONFIG $DIR/dancer-combined.jsonld -t "$TODAY-dancer-combined" > temp.jsonld
mv temp.jsonld $CONFIG

# Generate rankings for countries
$RANKING $OPTIONS_COUNTRY_BOTH > $DIR/country-both.jsonld
$UPDATECONFIG $DIR/country-both.jsonld -t "$TODAY-country-both" > temp.jsonld
mv temp.jsonld $CONFIG

$RANKING $OPTIONS_COUNTRY_HOME > $DIR/country-home.jsonld
$UPDATECONFIG $DIR/country-home.jsonld -t "$TODAY-country-home" > temp.jsonld
mv temp.jsonld $CONFIG

$RANKING $OPTIONS_COUNTRY_AWAY > $DIR/country-away.jsonld
$UPDATECONFIG $DIR/country-away.jsonld -t "$TODAY-country-away" > temp.jsonld
mv temp.jsonld $CONFIG
