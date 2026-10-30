import http from "node:http";
import util from "node:util";
import type { HealthCheckConfig } from "./config";

const createHealthCheckServer = ({ port }: HealthCheckConfig) => {
  let isHealthOk = false;
  let isReady = false;
  let server: http.Server | undefined = http.createServer((req, res) => {
    if (req.url === "/healthz") {
      if (isHealthOk) {
        res.writeHead(204);
      } else {
        res.writeHead(500);
      }
    } else if (req.url === "/readyz") {
      res.writeHead(isHealthOk && isReady ? 204 : 503);
    } else {
      res.writeHead(404);
    }
    res.end();
  });
  server.listen(port);
  const setHealthOk = (isOk: boolean) => {
    isHealthOk = isOk;
  };
  const setReady = (ready: boolean) => {
    isReady = ready;
  };
  const closeHealthCheckServer = async () => {
    if (server && server.listening) {
      await util.promisify(server.close.bind(server))();
      server = undefined;
    }
  };
  return { closeHealthCheckServer, setHealthOk, setReady };
};

export default createHealthCheckServer;
