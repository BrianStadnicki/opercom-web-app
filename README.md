# OperCom: alternative Teams client

OperCom is the beginnings of an alternative
Teams client, supporting reading chats and notifications.

It does not support any kind of live updates.

A dummy demo is available at [](https://brianstadnicki.github.io/opercom)

![](readme/preview.png)

The application exists as 2 components: a web app and a [Caddy](https://caddyserver.com/) proxy.

This is needed due to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

# Usage

```
Windows: $ yarn proxy-windows
Linux:   $ yarn proxy-linux
```

# Build

```
$ yarn build
```

# Development

```
Windows: $ yarn proxy-windows ; yarn dev
Linux:   $ yarn proxy-linux & yarn dev
```
