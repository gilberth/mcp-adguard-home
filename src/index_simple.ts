import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Api } from "./api.js";

// Configuration schema para Smithery
export const configSchema = z.object({
  adguardUsername: z.string().describe("Username for AdGuard Home authentication"),
  adguardPassword: z.string().describe("Password for AdGuard Home authentication"),
  adguardUrl: z.string().describe("Base URL of your AdGuard Home instance")
});

// Función para crear servidor stateless compatible con Smithery
export function createStatelessServer({ config }: { config: z.infer<typeof configSchema> }) {
  // Configurar API con los parámetros de configuración
  Api.configure(config);

  const server = new McpServer({
    name: "mcp-adguard-home",
    version: "1.0.1",
  });

  // Herramienta de verificación de conectividad (sin timeout)
  server.tool("check_connection", "Check AdGuard Home connection status", async () => {
    if (!config.adguardUsername || !config.adguardPassword || !config.adguardUrl) {
      return {
        content: [{ type: "text", text: "❌ Configuration incomplete" }],
      };
    }
    
    try {
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
      const records = await Api.rewrite.list();
      return {
        content: [{ 
          type: "text", 
          text: records.length > 0 
            ? records.map(r => `${r.domain} -> ${r.ip}`).join("\n")
            : "No DNS records found"
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
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
    async ({ domain, ip }) => {
      try {
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
    async ({ domain, ip }) => {
      try {
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

// Función para crear servidor stateful compatible con Smithery
export function createStatefulServer({ 
  sessionId, 
  config 
}: { 
  sessionId: string; 
  config: z.infer<typeof configSchema> 
}) {
  console.log(`Creating server for session: ${sessionId}`);
  return createStatelessServer({ config });
}
