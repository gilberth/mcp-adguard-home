import { z } from "zod";
import { DnsRecords, Filtering, type Rule } from "./schema";

// Configuración dinámica para Smithery
let adguardConfig: {
  username: string;
  password: string;
  url: string;
} = {
  username: '',
  password: '',
  url: ''
};

// Función para configurar la API con parámetros de Smithery
const configure = (config: { adguardUsername: string; adguardPassword: string; adguardUrl: string }) => {
  adguardConfig.username = config.adguardUsername;
  adguardConfig.password = config.adguardPassword;
  adguardConfig.url = config.adguardUrl;
};

// Fallback para desarrollo local con variables de entorno
const parseEnv = () => {
  const parsed = z
    .object({
      ADGUARD_USERNAME: z.string().optional(),
      ADGUARD_PASSWORD: z.string().optional(),
      ADGUARD_URL: z.string().optional(),
    })
    .safeParse(process.env);

  if (parsed.success && parsed.data.ADGUARD_USERNAME && parsed.data.ADGUARD_PASSWORD && parsed.data.ADGUARD_URL) {
    adguardConfig.username = parsed.data.ADGUARD_USERNAME;
    adguardConfig.password = parsed.data.ADGUARD_PASSWORD;
    adguardConfig.url = parsed.data.ADGUARD_URL;
  }
};

// Inicializar con variables de entorno si están disponibles
parseEnv();

const regex = /(@@)?\|\|(.+)\^\$.+/;

const getAuthorization = () => {
  if (!adguardConfig.username || !adguardConfig.password) {
    throw new Error("AdGuard credentials not configured");
  }
  return Buffer.from(
    `${adguardConfig.username}:${adguardConfig.password}`
  ).toString("base64");
};

const getHeaders = () => ({
  Authorization: `Basic ${getAuthorization()}`,
});

const serializeRule = (rule: Rule) => {
  return `${rule.allowed ? "@@" : ""}||${rule.domain}^$important`;
};

const api = (path: string, body?: Record<string, unknown>) => {
  if (!adguardConfig.url) {
    throw new Error("AdGuard URL not configured");
  }
  return fetch(`${adguardConfig.url}/control/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const Api = {
  configure,
  rules: {
    list: async () => {
      const res = await api("filtering/status");
      return Filtering.parse(await res.json());
    },
    update: async (domains: string[], allowed: boolean) => {
      const rules = await Api.rules.list();
      for (const domain of domains) {
        const rule = rules.find((rule) => rule.domain === domain);
        if (rule) {
          rule.allowed = allowed;
        } else {
          rules.push({
            domain,
            allowed,
          });
        }
      }
      return api("filtering/set_rules", { rules: rules.map(serializeRule) });
    },
    remove: async (domains: string[]) => {
      const prev = await Api.rules.list();
      return api("filtering/set_rules", {
        rules: prev
          .filter((rule) => !domains.includes(rule.domain))
          .map(serializeRule),
      });
    },
  },
  rewrite: {
    list: async () => {
      const res = await api("rewrite/list");
      return DnsRecords.parse(await res.json());
    },
    add: async (domain: string, answer: string) =>
      api("rewrite/add", {
        domain,
        answer,
      }),
    remove: async (domain: string, answer: string) =>
      api("rewrite/delete", {
        domain,
        answer,
      }),
  },
};
