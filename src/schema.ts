import { z } from "zod";

export const DnsRecords = z
  .object({
    domain: z.string(),
    answer: z.string(),
  })
  .transform((data) => ({
    domain: data.domain,
    ip: data.answer,
  }))
  .array();

const regex = /(@@)?\|\|(.+)\^\$.+/;

export const Filtering = z
  .object({
    user_rules: z
      .string()
      .transform((rule) => {
        if (!rule) return null;
        const match = regex.exec(rule);
        return {
          domain: match?.[2] ?? "",
          allowed: match?.[1] === "@@",
        };
      })
      .array(),
  })
  .transform((data) => data.user_rules.filter((rule) => rule !== null));

export type Rule = z.infer<typeof Filtering>[number];
