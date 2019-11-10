#!/usr/bin/env bash

ROOTDIR=$1
LDFSERVERID=$2

if [ "$ROOTDIR" = "" ]
then
  echo "Please provide a directory path."
  exit 1;
fi

RANKING="../ranking/bin/cli.js"

OPTIONS_DANCER_1VS1="-p 1 -f -j"
OPTIONS_DANCER_2VS2="-p 2 -f -j"
OPTIONS_DANCER_COMBINED="-f -j"
OPTIONS_COUNTRY_BOTH="-r country -j"
OPTIONS_COUNTRY_HOME="-r country -h -j"
OPTIONS_COUNTRY_AWAY="-r country -a -j"

DIR=$ROOTDIR/$(date +%Y-%m-%d);

mkdir $DIR

# Generate rankings for dancers
$RANKING $OPTIONS_DANCER_1VS1 > $DIR/dancer-1vs1.jsonld
$RANKING $OPTIONS_DANCER_2VS2 > $DIR/dancer-2vs2.jsonld
$RANKING $OPTIONS_DANCER_COMBINED > $DIR/dancer-combined.jsonld

# Generate rankings for countries
$RANKING $OPTIONS_COUNTRY_BOTH > $DIR/country-both.jsonld
$RANKING $OPTIONS_COUNTRY_HOME > $DIR/country-home.jsonld
$RANKING $OPTIONS_COUNTRY_AWAY > $DIR/country-away.jsonld
