#!/bin/bash
echo "Pulling changes"
git pull
echo "Reloading bot"
~/.volta/bin/pm2 reload bot
echo "Done"
