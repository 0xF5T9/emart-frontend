# E-Mart Frontend

> E-Mart NodeJS frontend repository.

## Preview

![preview](https://github.com/user-attachments/assets/490d3993-f4df-4e6f-a676-e60b1aa6f3ea)
![preview-mobile](https://github.com/user-attachments/assets/3cec3808-fc9f-4621-b257-8e282e433534)


## Prerequisites

- npm >= v10.5.2
- node >= v20.13.1
- nginx >= 1.26.2
- Domain with SSL
- Port forwarding: 80, 443 (Alternatively Cloudflare Tunnel)
- [E-Mart Backend](https://github.com/0xF5T9/emart-backend)

## Install

### 1. Install dependencies

```shell
npm install
```

### 2. Configure nginx reverse proxy

Proxy that expose front-end server.

(Obviously, only one configuration may be active at the same time.)

#### 2A. Development configuration

`mydomain.com.frontend-dev.conf`

```plain
# Redirect HTTP to HTTPS. (Frontend)
server {
    listen 80;
    server_name mydomain.com;
    client_max_body_size 100M;
    return 308 https://mydomain.com$request_uri;
}

# Proxy pass to webpack dev server.
server {
    listen 443 ssl;
    server_name mydomain.com;
    client_max_body_size 100M;
    ssl_certificate path/to/ssl/cert.pem;
    ssl_certificate_key path/to/ssl/cert-key.pem;

    location / {
        # proxy_cache off;
        proxy_pass https://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2B. Production configuration

`mydomain.com.frontend-prod.conf`

```plain
# Redirect HTTP to HTTPS. (Frontend Server)
server {
    listen 80;
    server_name mydomain.com;
    client_max_body_size 100M;
    return 308 https://mydomain.com$request_uri;
}

# Proxy pass to node frontend server.
server {
    listen 443 ssl;
    server_name mydomain.com;
    client_max_body_size 100M;
    ssl_certificate path/to/ssl/cert.pem;
    ssl_certificate_key path/to/ssl/cert-key.pem;

    location / {
        # proxy_cache off;
        proxy_pass http://localhost:8317;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        # proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Set environment variables

- `NODE_ENV` - `development` or `production`
- `API_URL` - API URL.
- `UPLOAD_URL` - Upload URL.
- `PORT` - Production server port.
- `WEBPACK_DEV_SERVER_OPEN_URL` - Webpack dev server will automatically open this url in the default browser.
- `WEBPACK_PATH_TO_CERT` - Path to certificate file. (Dev mode only)
- `WEBPACK_PATH_TO_CERT_KEY` - Path to certificate key file. (Dev mode only)

```bash
NODE_ENV=development
API_URL=https://api.mydomain.com
UPLOAD_URL=https://upload.mydomain.com
PORT=8317
WEBPACK_DEV_SERVER_OPEN_URL=https://mydomain.com
WEBPACK_PATH_TO_CERT=path/to/ssl/cert.pem
WEBPACK_PATH_TO_CERT_KEY=path/to/ssl/cert-key.pem
```

## Usage

```bash
# Start server in development mode (NODE_ENV value must be 'development')
npm run start-webpack

# Or start server in production mode (NODE_ENV value must be 'production')
npm run build-prod # Build production
npm start # Start production server
```

Check `package.json`, `.vscode` folder for scripts and tasks.

## Credits

- Frontend design originally by [VyFood](https://github.com/hgbaodev/Webbanhang).
