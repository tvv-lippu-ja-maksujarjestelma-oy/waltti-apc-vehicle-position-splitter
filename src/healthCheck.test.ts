import http from "node:http";
import { once } from "node:events";
import createHealthCheckServer from "./healthCheck";

test("liveness stays healthy while catalogue readiness waits", async () => {
  const createServer = jest.spyOn(http, "createServer");
  const { closeHealthCheckServer, setHealthOk, setReady } =
    createHealthCheckServer({ port: 0 });
  const server = createServer.mock.results[0]?.value as http.Server;
  try {
    await once(server, "listening");
    const address = server.address();
    if (address == null || typeof address === "string")
      throw new Error("Missing test server port");
    const status = async (path: string): Promise<number | undefined> =>
      new Promise((resolve, reject) => {
        const request = http.get(
          { hostname: "127.0.0.1", port: address.port, path },
          (response) => {
            response.resume();
            response.on("end", () => resolve(response.statusCode));
          }
        );
        request.on("error", reject);
      });
    setHealthOk(true);
    expect(await status("/healthz")).toBe(204);
    expect(await status("/readyz")).toBe(503);
    setReady(true);
    expect(await status("/readyz")).toBe(204);
    setHealthOk(false);
    expect(await status("/readyz")).toBe(503);
    expect(await status("/healthz")).toBe(500);
  } finally {
    await closeHealthCheckServer();
    createServer.mockRestore();
  }
});
