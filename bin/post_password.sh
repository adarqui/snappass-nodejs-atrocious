#!/bin/bash

key=`curl -X POST localhost:5000/$RANDOM/Day`
echo "key: $key"
pass=`curl localhost:5000/$key`
echo "pass #1: $pass"
pass=`curl localhost:5000/$key`
echo "pass #2: $pass"
