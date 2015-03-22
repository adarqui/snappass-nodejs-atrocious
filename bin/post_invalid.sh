#!/bin/bash

resp=`curl -X POST localhost:5000//Day`
echo "response: $resp"

resp=`curl -X POST localhost:5000/$RANDOM/Blah`
echo "response: $resp"
