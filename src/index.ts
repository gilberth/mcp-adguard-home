import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Api } from "./api.js";

// Configuration schema para Smithery
export const configSchema = z.object({
  adguardUsername: z.string().describe("Username for AdGuard Home authentication"),
  adguardPassword: z.string().describe("Password for AdGuard Home authentication"),
  adguardUrl: z.string().describe("Base URL of your AdGuard Home instance")
});

// Export default function for Smithery
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new Server(
    {
      name: "mcp-adguard-home",
      version: "1.0.1",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

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
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "check_connection",
          description: "Check AdGuard Home connection status",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "list_dns_records",
          description: "List all DNS rewrite records",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "add_dns_record",
          description: "Add a DNS rewrite record",
          inputSchema: {
            type: "object",
            properties: {
              domain: {
                type: "string",
                description: "Domain name",
              },
              ip: {
                type: "string",
                description: "IP address",
              },
            },
            required: ["domain", "ip"],
          },
        },
        {
          name: "remove_dns_record",
          description: "Remove a DNS rewrite record",
          inputSchema: {
            type: "object",
            properties: {
              domain: {
                type: "string",
                description: "Domain name",
              },
              ip: {
                type: "string",
                description: "IP address",
              },
            },
            required: ["domain", "ip"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === "check_connection") {
      return await handleCheckConnection();
    }
    
    if (name === "list_dns_records") {
      return await handleListDnsRecords();
    }
    
    if (name === "add_dns_record") {
      return await handleAddDnsRecord(args as { domain: string; ip: string });
    }
    
    if (name === "remove_dns_record") {
      return await handleRemoveDnsRecord(args as { domain: string; ip: string });
    }
    
    throw new Error(`Unknown tool: ${name}`);
  });

  const handleCheckConnection = async () => {
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
  };

  const handleListDnsRecords = async () => {
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
  };

  const handleAddDnsRecord = async (args: { domain: string; ip: string }) => {
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
  };

  const handleRemoveDnsRecord = async (args: { domain: string; ip: string }) => {
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
  };

  return server;
}

