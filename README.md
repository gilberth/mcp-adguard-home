# 🛡️ AdGuard Home MCP

A [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) server implementation for [AdGuard Home](https://adguard.com/en/adguard-home/overview.html). Easily query and manage DNS records, filtering rules, and more via AI agents.

[![npm version](https://badge.fury.io/js/@fcannizzaro%2Fmcp-adguard-home.svg)](https://www.npmjs.com/package/@fcannizzaro/mcp-adguard-home)
[![CI: Publish Package](https://github.com/fcannizzaro/mcp-adguard-home/actions/workflows/publish-package.yaml/badge.svg)](https://github.com/fcannizzaro/mcp-adguard-home/actions/workflows/publish-package.yaml)

## 🚀 Quick Start with Smithery.ai

This server is ready to deploy on [Smithery.ai](https://smithery.ai)! Simply upload this repository and configure your AdGuard Home credentials.

### Configuration Required:

- **AdGuard Username**: Your AdGuard Home admin username
- **AdGuard Password**: Your AdGuard Home admin password
- **AdGuard URL**: Base URL of your AdGuard Home instance (e.g., `http://localhost:3000`)

## 📦 Local Installation

  {  
    "mcpServers": {
    
      "adguard-home": {
      
        "command": "npx",
        
        "args": ["-y", "@thelord/mcp-adguard-home"],
        
        "env": {
        
          "ADGUARD_USERNAME": "admin",
          
          "ADGUARD_PASSWORD": "tu-password",
          
          "ADGUARD_URL": "http://192.168.1.100:3000"
          
        }
        
      }      
      
    }    
  }


## 📄 License

Licensed under the [MIT License](LICENSE).

A FORK FROM : https://github.com/fcannizzaro/mcp-adguard-home 
