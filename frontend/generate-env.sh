#!/bin/sh
echo "window.ENV = {" > /usr/share/nginx/html/config.js
for var in $(env | grep ^REACT_APP_); do
  key=$(echo "$var" | cut -d= -f1)
  val=$(echo "$var" | cut -d= -f2-)
  # escape quotes in value if any
  escaped_val=$(echo "$val" | sed 's/"/\\"/g')
  echo "  $key: \"$escaped_val\"," >> /usr/share/nginx/html/config.js
done
echo "};" >> /usr/share/nginx/html/config.js
