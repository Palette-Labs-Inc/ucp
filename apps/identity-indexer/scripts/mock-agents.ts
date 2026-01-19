import http from "http";
import { z } from "zod";
import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import {
  UcpDiscoveryProfileSchema,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

type Route = readonly [RegExp, (match: RegExpMatchArray) => unknown];

interface AgentDescriptor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  agentUriUrl: string;
  ucpProfileUrl: string;
}

interface MockConfig {
  port: number;
  baseUrl: string;
  ucpVersion: string;
  agentIds: string[];
}

const AGENT_PATHS = {
  wellKnownUcp: "/.well-known/ucp",
  agentUriFilename: "agent-uri.json",
} as const;

const UCP_SPEC = {
  shopping: {
    spec: "https://ucp.dev/specification/shopping",
    restSchema: "https://ucp.dev/services/shopping/rest.openapi.json",
  },
  catalog: {
    spec: "https://ucp.dev/specification/shopping/catalog",
    schema: "https://ucp.dev/schemas/shopping/catalog.json",
  },
  checkout: {
    spec: "https://ucp.dev/specification/shopping/checkout",
    schema: "https://ucp.dev/schemas/shopping/checkout.json",
  },
} as const;

const AgentIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const AgentIdListSchema = z
  .string()
  .regex(/^[a-z0-9-]+(,[a-z0-9-]+)*$/)
  .transform((value) => value.split(","))
  .pipe(z.array(AgentIdSchema).nonempty());
const RequestUrlSchema = z.string().min(1);
const UcpVersionSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function buildAgentDescriptor(
  id: string,
  index: number,
  baseUrl: string
): AgentDescriptor {
  const name = `Mock Merchant ${index + 1}`;
  const description = `Mock merchant agent ${index + 1} for local testing.`;
  const imageUrl = "https://example.com/agentimage.png";
  const agentUriUrl = `${baseUrl}/agents/${id}/${AGENT_PATHS.agentUriFilename}`;
  const ucpProfileUrl = `${baseUrl}/agents/${id}${AGENT_PATHS.wellKnownUcp}`;
  return {
    id,
    name,
    description,
    imageUrl,
    agentUriUrl,
    ucpProfileUrl,
  };
}

function stripWellKnownUcp(endpoint: string): string {
  return endpoint.replace(AGENT_PATHS.wellKnownUcp, "");
}

function buildAgentUri(agent: AgentDescriptor): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: agent.name,
    description: agent.description,
    image: agent.imageUrl,
    endpoints: [
      {
        name: "UCP",
        endpoint: agent.ucpProfileUrl,
      },
    ],
    active: true,
    registrations: [],
  });
}

function buildUcpDiscoveryProfile(
  agent: AgentDescriptor,
  version: string
): UcpDiscoveryProfile {
  const endpointBase = stripWellKnownUcp(agent.ucpProfileUrl);
  return UcpDiscoveryProfileSchema.parse({
    version,
    services: {
      "dev.ucp.shopping.rest": {
        version,
        spec: UCP_SPEC.shopping.spec,
        rest: {
          schema: UCP_SPEC.shopping.restSchema,
          endpoint: endpointBase,
        },
      },
    },
    capabilities: [
      {
        name: "dev.ucp.shopping.catalog",
        version,
        spec: UCP_SPEC.catalog.spec,
        schema: UCP_SPEC.catalog.schema,
      },
      {
        name: "dev.ucp.shopping.checkout",
        version,
        spec: UCP_SPEC.checkout.spec,
        schema: UCP_SPEC.checkout.schema,
      },
    ],
  });
}

function buildAgentsListing(agents: AgentDescriptor[]) {
  return {
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      agentUriUrl: agent.agentUriUrl,
      ucpProfileUrl: agent.ucpProfileUrl,
    })),
  };
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  payload: unknown
) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendNotFound(res: http.ServerResponse) {
  sendJson(res, 404, { error: "Not Found" });
}

function sendMethodNotAllowed(res: http.ServerResponse) {
  sendJson(res, 405, { error: "Method Not Allowed" });
}

function requireAgent(
  agentMap: Map<string, AgentDescriptor>,
  agentId: string
): AgentDescriptor {
  const agent = agentMap.get(agentId);
  if (!agent) throw new Error("agent_not_found");
  return agent;
}

function buildRoutes(args: {
  agentMap: Map<string, AgentDescriptor>;
  listingPayload: ReturnType<typeof buildAgentsListing>;
  ucpVersion: string;
}): Route[] {
  const agentFromMatch = (match: RegExpMatchArray) =>
    requireAgent(args.agentMap, AgentIdSchema.parse(match[1]));
  return [
    [/^\/$/, () => args.listingPayload],
    [/^\/agents$/, () => args.listingPayload],
    [/^\/agents\/([^/]+)$/, (match) => agentFromMatch(match)],
    [
      /^\/agents\/([^/]+)\/agent-uri\.json$/,
      (match) => buildAgentUri(agentFromMatch(match)),
    ],
    [
      /^\/agents\/([^/]+)\/\.well-known\/ucp$/,
      (match) => buildUcpDiscoveryProfile(agentFromMatch(match), args.ucpVersion),
    ],
  ];
}

function resolveRoute(routes: Route[], pathname: string) {
  const entry = routes.find(([pattern]) => pattern.test(pathname));
  if (!entry) return null;
  const match = pathname.match(entry[0]);
  if (!match) return null;
  return { handler: entry[1], match };
}

const EnvSchema = z
  .object({
    MOCK_AGENT_PORT: z.coerce.number().int().positive().default(4010),
    MOCK_AGENT_BASE_URL: z.string().url(),
    MOCK_UCP_VERSION: UcpVersionSchema.default("2026-01-11"),
    MOCK_AGENT_IDS: AgentIdListSchema,
  })
  .superRefine((env, ctx) => {
    const url = new URL(env.MOCK_AGENT_BASE_URL);
    const resolvedPort = url.port.length > 0 ? Number(url.port) : 80;
    if (resolvedPort !== env.MOCK_AGENT_PORT) {
      ctx.addIssue({
        code: "custom",
        message: "MOCK_AGENT_BASE_URL port must match MOCK_AGENT_PORT",
        path: ["MOCK_AGENT_BASE_URL"],
      });
    }
  })
  .transform((env): MockConfig => {
    return {
      port: env.MOCK_AGENT_PORT,
      baseUrl: env.MOCK_AGENT_BASE_URL,
      ucpVersion: env.MOCK_UCP_VERSION,
      agentIds: env.MOCK_AGENT_IDS,
    };
  });

function loadConfig(): MockConfig {
  return EnvSchema.parse(process.env);
}

const config = loadConfig();
const agents = config.agentIds.map((id, index) =>
  buildAgentDescriptor(id, index, config.baseUrl)
);
const agentMap = new Map(agents.map((agent) => [agent.id, agent]));
const listingPayload = buildAgentsListing(agents);

const routes = buildRoutes({
  agentMap,
  listingPayload,
  ucpVersion: config.ucpVersion,
});

const server = http.createServer((req, res) => {
  if (req.method !== "GET") return sendMethodNotAllowed(res);
  const requestUrl = RequestUrlSchema.safeParse(req.url);
  if (!requestUrl.success) return sendNotFound(res);
  const url = new URL(requestUrl.data, config.baseUrl);
  const resolved = resolveRoute(routes, url.pathname);
  if (!resolved) return sendNotFound(res);
  return sendJson(res, 200, resolved.handler(resolved.match));
});

server.listen(config.port, () => {
  console.log(`Mock agent host listening on ${config.baseUrl}`);
  console.log("Agents:");
  for (const agent of agents) {
    console.log(`- ${agent.id}`);
    console.log(`  agentURI: ${agent.agentUriUrl}`);
    console.log(`  ucp: ${agent.ucpProfileUrl}`);
  }
});
