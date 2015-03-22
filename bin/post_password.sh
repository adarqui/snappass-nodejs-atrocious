#!/bin/bash

key=`curl -s -X POST localhost:5000/$RANDOM/Day`
echo "key: $key"
pass=`curl -s localhost:5000/$key`
echo "pass #1: $pass"
pass=`curl -s localhost:5000/$key`
echo "pass #2: $pass"
