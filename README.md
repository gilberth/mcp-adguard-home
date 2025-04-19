# AdGuard Home MCP

A [Model Context Protocol](https://modelcontextprotocol.io/introduction) server implementation for [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) that enables AI agents to query and manage DNS records, filtering rules and more.

[![npm version](https://badge.fury.io/js/@fcannizzaro%2Fmcp-adguard-home.svg)](https://www.npmjs.com/package/@fcannizzaro/mcp-adguard-home)
[![Publish Package to npmjs](https://github.com/fcannizzaro/mcp-adguard-home/actions/workflows/publish-package.yaml/badge.svg)](https://github.com/fcannizzaro/mcp-adguard-home/actions/workflows/publish-package.yaml)

## Installation

```bash
npm i -g @fcannizzaro/mcp-adguard-home
```

## Configuration

Environment Variables:

```dotenv
ADGUARD_USERNAME=
ADGUARD_PASSWORD=
ADGUARD_URL=
```

## Usage

Configure your MCP client to use `mcp-adguard-home` as the server.

![AdGuard Home](/.media/adguard-home.gif)

## Tools

### List rewrite dns records

> list all dns records and make a table with the results

### Add rewrite dns record

> add dns record for test.mydomain.com 192.168.1.10
>
> add dns record for test.mydomain.com 192.168.1.10

### Delete rewrite dns record

> delete dns record for test.mydomain.com
>
> delete the latest dns record

### Add filtering dns rule

> block the test.mydomain.com domain
>
> add dns filtering rule for test.mydomain.com

### Delete filtering dns rule

> delete filtering rule for test.mydomain.com
>
> delete the latest filtering rule

## License

[MIT](LICENSE) License
