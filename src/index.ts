import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Api } from "./api";

const server = new McpServer({
  name: "mcp-adguard-home",
  version: "1.0.0",
});

server.tool("list_rewrite_dns_records", "List all DNS records", async () => {
  const records = await Api.rewrite.list();
  return {
    content: [
      {
        type: "text",
        text: records
          .map((record) => `${record.domain} -> ${record.ip}`)
          .join("\n"),
      },
    ],
  };
});

server.tool(
  "add_rewrite_dns_record",
  "Add a DNS record using the host and ip address",
  {
    domain: z.string(),
    ip: z
      .string()
      .describe(
        "if the ip is missing get the most common ip in the list of dns record before use this tool"
      ),
  },
  async ({ domain, ip }) => {
    await Api.rewrite.add(domain, ip);
    return {
      content: [{ type: "text", text: `Added DNS entry: ${domain} -> ${ip}` }],
    };
  }
);

server.tool(
  "remove_rewrite_dns_record",
  "Remove a DNS record using the domain and ip address",
  {
    domain: z.string(),
    ip: z.string(),
  },
  async ({ domain, ip }) => {
    await Api.rewrite.remove(domain, ip);
    return {
      content: [
        { type: "text", text: `Removed DNS entry: ${domain} -> ${ip}` },
      ],
    };
  }
);

server.tool(
  "list_dns_filtering_rules",
  "List all DNS allowed or blocked rules",
  async () => {
    const rules = await Api.rules.list();
    return {
      content: rules.map((rule) => ({
        type: "text",
        text: `${rule.domain} = ${rule.allowed ? "Allowed" : "Blocked"}`,
      })),
    };
  }
);

server.tool(
  "manage_dns_filtering_rules",
  "Block or allow a DNS filtering record rules",
  {
    domains: z.array(z.string()),
    allowed: z.boolean(),
  },
  async ({ domains, allowed }) => {
    await Api.rules.update(domains, allowed);
    return {
      content: [
        {
          type: "text",
          text: `Added or updated DNS record rules:\n${domains
            .map((domain) => `${domain} = ${allowed ? "Allowed" : "Blocked"}`)
            .join("\n")}`,
        },
      ],
    };
  }
);

server.tool(
  "remove_rdns_filtering_rules",
  "Remove a DNS filtering record rules",
  {
    domains: z.array(z.string()),
  },
  async ({ domains }) => {
    await Api.rules.remove(domains);
    return {
      content: [
        {
          type: "text",
          text: `Removed DNS record rules:\n${domains.join("\n")}`,
        },
      ],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
