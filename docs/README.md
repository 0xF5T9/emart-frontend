# VyFood Frontend

> VyFood NodeJS frontend repository.

## Preview

[View more](PREVIEW.md)

![full-page](https://github.com/user-attachments/assets/08c5fa92-8897-434e-b68a-c46ef988d886)

## Prerequisites

- npm >= v10.5.2
- node >= v20.13.1
- nginx >= 1.26.2
- [VyFood Backend](https://github.com/0xF5T9/VyFood-backend)

## Install

### 1. Install dependencies

```shell
npm install
```

### 2. Configure nginx reverse proxy (Production)

Proxy that expose front-end server.

`nginx.conf`

```plain
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    client_max_body_size 100M;

    include       mydomain.com.conf;
}
```

`mydomain.com.conf`

```plain
server {
    listen 80;
    server_name mydomain.com;
    return 301 https://mydomain.com$request_uri;
}

server {
    listen 443 ssl;
    server_name mydomain.com;
    root path/to/frontend/project/public;
    ssl_certificate path/to/ssl/cert.pem;
    ssl_certificate_key path/to/ssl/cert-key.pem;

    location / {
        # proxy_cache off;
        proxy_pass http://localhost:8317;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Disable cache.
        # add_header Cache-Control "no-cache, no-store, must-revalidate";
        # add_header Pragma "no-cache";
        # add_header Expires "0";
    }
}

# Other backend proxies ...
```

### 3. Update project configuration files

Update the project configuration files in `./configs` folder.

### 4. Set environment variables

Set `NODE_ENV` to `development` or `production`

```shell
NODE_ENV=development
```

## Usage

Check `package.json`, `.vscode` folder for scripts and tasks.
