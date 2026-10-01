#!/bin/sh
set -eu

RUNTIME_JSON=$(jq -n --arg apiBaseUrl "${UI_API_BASE_URL:-/}" '{apiBaseUrl: $apiBaseUrl}')
printf 'window.__HERMES_CONFIG__ = %s;\n' "$RUNTIME_JSON" > /usr/share/nginx/html/config.js
