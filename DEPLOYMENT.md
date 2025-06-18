# AdGuard Home MCP Server - Deployment Guide

## 🚀 Deploying to Smithery.ai

### Prerequisites

- Your AdGuard Home instance must be accessible from the internet or from where Smithery runs
- AdGuard Home admin credentials

### Steps to Deploy

1. **Upload to Smithery.ai**

   - Go to [Smithery.ai](https://smithery.ai)
   - Upload this repository or connect your GitHub repository
   - Smithery will automatically detect the `smithery.yaml` configuration

2. **Configure Your AdGuard Home Settings**

   - **AdGuard Username**: Your admin username (e.g., `admin`)
   - **AdGuard Password**: Your admin password
   - **AdGuard URL**: Your AdGuard Home URL (e.g., `http://192.168.1.100:3000` or `https://your-domain.com`)

3. **Test the Connection**
   - Use the Smithery playground to test the tools
   - Try listing DNS records: `list_rewrite_dns_records`

### Example Configuration

```yaml
adguardUsername: "admin"
adguardPassword: "your-secure-password"
adguardUrl: "http://192.168.1.100:3000"
```

## 🔧 Available Tools

### DNS Rewrite Tools

- `list_rewrite_dns_records` - List all DNS rewrite records
- `add_rewrite_dns_record` - Add a new DNS rewrite record
- `remove_rewrite_dns_record` - Remove a DNS rewrite record

### DNS Filtering Tools

- `list_dns_filtering_rules` - List all filtering rules (allowed/blocked)
- `manage_dns_filtering_rules` - Add or update filtering rules
- `remove_dns_filtering_rules` - Remove filtering rules

## 🛠️ Local Development

If you want to develop locally:

```bash
# Install dependencies
npm install

# Start development server with Smithery CLI
npm run dev

# Build for production
npm run smithery:build
```

## 🔒 Security Notes

- Make sure your AdGuard Home instance is properly secured
- Use strong passwords for your AdGuard Home admin account
- Consider using HTTPS for your AdGuard Home instance
- If deploying publicly, ensure proper firewall configuration

## 📞 Support

If you encounter issues:

1. Check your AdGuard Home is accessible from the deployment environment
2. Verify your credentials are correct
3. Check AdGuard Home logs for authentication errors
4. Ensure your AdGuard Home version is compatible (v0.107+)
