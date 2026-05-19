import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "mcp-remote", "https://mcp.linear.app/mcp"],
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("Connected to Linear MCP!");
    
    const teams = await client.request({
      method: "call_tool",
      params: {
        name: "list_teams",
        arguments: {},
      },
    }, {
      // Define schema for expected response if needed
    });
    
    console.log("Teams found:", JSON.stringify(teams, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error connecting or calling tool:", error.message);
    process.exit(1);
  }
}

main();
