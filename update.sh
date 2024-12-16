#!/bin/bash
echo Pulling changes
git pull
echo Killing existing bot
screen -XS bot kill
echo Starting new bot
screen -dmS bot bun start
screen -ls
