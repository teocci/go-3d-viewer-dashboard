## go-3d-viewer-dashboard [![Go Reference][1]][2]

`go-3d-viewer-dashboard` is an open-source sample using gin-gonic as a webserver as basic clean project.

## Disclaimer
> This tool is limited to security research only, and the user assumes all legal and related responsibilities arising from its use! The author assumes no legal responsibility!

## config
Change the port for the web server on the `config.json` file
```json
{
  "web": {
    "port": 10010
  },
  "ws": {
    "port": 10020
  }
}
```

## Run
```bash
go run main.go

open http://localhost:10010/page.html
```

## Docker

### Manually
```bash
docker build --tag webserver .
docker run -p 10010:10010 -p 10020:10020 webserver
```

### Docker compose
```bash
docker compose up
```

Rebuild
```bash
docker compose up --build
```

[1]: https://pkg.go.dev/badge/github.com/teocci/go-3d-viewer-dashboard.svg
[2]: https://pkg.go.dev/github.com/teocci/go-3d-viewer-dashboard
[3]: https://github.com/teocci/go-3d-viewer-dashboard/releases/tag/v1.0.0



