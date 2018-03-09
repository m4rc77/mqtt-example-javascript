#!/usr/bin/env bash

npm run clean

npm run build

echo "========================================="
echo "Server listening on http://localhost:3000"
echo "========================================="
npm run start