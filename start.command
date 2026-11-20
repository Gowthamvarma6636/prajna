#!/bin/bash
# Double-click me. Serves the dashboard on http://localhost:8000
cd "$(dirname "$0")"
PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
echo ""
echo "  🎂  Prajna's birthday dashboard is live"
echo "  →   http://localhost:$PORT"
echo "      (press Ctrl+C to stop)"
echo ""
( sleep 1; open "http://localhost:$PORT" ) &
python3 "$(dirname "$0")/serve.py" $PORT
