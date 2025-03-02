import createFetchClient from "openapi-fetch";
import type { paths } from "@/types/shared-types";

import type { Middleware } from "openapi-fetch";

function authMiddleware(getToken: () => string | null): Middleware {
  return{
    async onRequest({ schemaPath, request }) {
      // Only add the token to requests to the /admin path
      if (!schemaPath.startsWith("/admin")) {
        return undefined;
      }

      const accessToken = getToken();
      if (accessToken) {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return request;
    },
  };
}

export const createApiClient = (getToken: () => string | null) => {
  const client = createFetchClient<paths>({
    baseUrl: "http://localhost:8080/api/v1",
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },
  });

  client.use(authMiddleware(getToken));

  return client;
};