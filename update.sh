#!/bin/bash
echo "Updating SpaceBot"
cd ~/code/SpaceBot
echo "Pulling changes"
git pull
echo "Reloading bot"
pm2 reload bot
echo "Done"
