FROM golang:alpine AS builder
RUN apk update && apk add git
WORKDIR /go/src
COPY . ./

ENV CGO_ENABLED=0
RUN go get
RUN go mod download
RUN go build -a -o webserver

FROM alpine

WORKDIR /app

COPY --from=builder /go/src/webserver ./
COPY --from=builder /go/src/web ./web

COPY --from=builder /go/src/config.json ./

ENV GO111MODULE="on"
ENV GIN_MODE="release"

EXPOSE 10010
EXPOSE 10020

CMD ["./webserver"]