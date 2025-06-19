import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Api } from "./api.js";

// Configuration schema para Smithery
export const configSchema = z.object({
  adguardUsername: z.string().describe("Username for AdGuard Home authentication"),
  adguardPassword: z.string().describe("Password for AdGuard Home authentication"),
  adguardUrl: z.string().describe("Base URL of your AdGuard Home instance")
});

// Función para crear servidor MCP - exportada para Smithery
export function createStatelessServer({ sessionId, config }: { sessionId: string; config?: z.infer<typeof configSchema> }) {
  // NO configurar API automáticamente - solo cuando se ejecute una herramienta
  
  const server = new McpServer({
    name: "mcp-adguard-home",
    version: "1.0.1",
  });

  // Función helper para configurar API solo cuando sea necesario
  const configureApiIfNeeded = () => {
    try {
      if (config?.adguardUsername && config?.adguardPassword && config?.adguardUrl) {
        Api.configure(config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error configuring API:', error);
      return false;
    }
  };

  // Herramienta de verificación de conectividad
  server.tool("check_connection", "Check AdGuard Home connection status", async () => {
    try {
      if (!configureApiIfNeeded()) {
        return {
          content: [{ type: "text", text: "❌ Configuration incomplete. Please configure AdGuard credentials first." }],
        };
      }
      
      const records = await Api.rewrite.list();
      return {
        content: [{ type: "text", text: `✅ Connected! Found ${records.length} DNS records` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      };
    }
  });

  // DNS Tools
  server.tool("list_dns_records", "List all DNS rewrite records", async () => {
    try {
      if (!configureApiIfNeeded()) {
        return {
          content: [{ type: "text", text: "❌ Configuration incomplete. Please configure AdGuard credentials first." }],
        };
      }
      
      const records = await Api.rewrite.list();
      return {
        content: [{ 
          type: "text", 
          text: records.length > 0 
            ? records.map((r: any) => `${r.domain} -> ${r.ip}`).join("\n")
            : "No DNS records found"
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      };
    }
  });

  server.tool(
    "add_dns_record",
    "Add a DNS rewrite record",
    {
      domain: z.string().describe("Domain name"),
      ip: z.string().describe("IP address"),
    },
    async (args: { domain: string; ip: string }) => {
      try {
        const { domain, ip } = args;
        if (!configureApiIfNeeded()) {
          return {
            content: [{ type: "text", text: "❌ Configuration incomplete. Please configure AdGuard credentials first." }],
          };
        }
        
        await Api.rewrite.add(domain, ip);
        return {
          content: [{ type: "text", text: `✅ Added DNS record: ${domain} -> ${ip}` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `❌ Failed to add record: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        };
      }
    }
  );

  server.tool(
    "remove_dns_record",
    "Remove a DNS rewrite record",
    {
      domain: z.string().describe("Domain name"),
      ip: z.string().describe("IP address"),
    },
    async (args: { domain: string; ip: string }) => {
      try {
        const { domain, ip } = args;
        if (!configureApiIfNeeded()) {
          return {
            content: [{ type: "text", text: "❌ Configuration incomplete. Please configure AdGuard credentials first." }],
          };
        }
        
        await Api.rewrite.remove(domain, ip);
        return {
          content: [{ type: "text", text: `✅ Removed DNS record: ${domain} -> ${ip}` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `❌ Failed to remove record: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        };
      }
    }
  );

  return server.server;
}

// Smithery se encargará de crear y ejecutar el servidor
