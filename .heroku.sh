#!/bin/bash
if [[ -v HEROKU_DEPLOYED ]]; then 
    echo "manually installing dev dependencies for heroku"
    npm install --dev
fi 