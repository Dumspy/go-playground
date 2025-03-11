import createFetchClient from "openapi-fetch";
import type { paths } from "@/types/shared-types";

import type { Middleware } from "openapi-fetch";

type jwtPayload = {
  UserID:   string,
	Username: string,
  iss:      string,
  exp:      number,
  iat:      number,
}

function createBaseClient() {
  return createFetchClient<paths>({
    baseUrl: "http://localhost:8080/api/v1",
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },
  });
}

function authMiddleware(getToken: () => string | null, setToken: (token: string) => void): Middleware {
  let isRefreshing = false;
  let pendingRequests: (() => void)[] = [];

  return {
    async onRequest({ schemaPath, request }) {
      // Only add the token to requests to the /admin path
      if (!schemaPath.startsWith("/admin")) {
        return undefined;
      }

      const accessToken = getToken();
      if (accessToken) {
        const jwt = JSON.parse(atob(accessToken.split(".")[1])) as jwtPayload;

        if (jwt.exp * 1000 < Date.now()) {
          // Token is expired, refresh it
          if (!isRefreshing) {
            isRefreshing = true;
            const api = createBaseClient();

            const response = await api.POST("/auth/refresh");

            if (response.data?.authToken) {
              setToken(response.data.authToken);
              pendingRequests.forEach(callback => callback());
              pendingRequests = [];
            } else {
              // Handle token refresh failure
            }

            isRefreshing = false;
          }

          // Block other requests until the token is refreshed
          await new Promise<void>((resolve) => {
            pendingRequests.push(resolve);
          });
        }

        request.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return request;
    },
  };
}

export const createApiClient = (getToken: () => string | null, setToken: (string: string) => void, includeAuthMiddleware = true) => {
  const client = createBaseClient();

  if (includeAuthMiddleware){
    client.use(authMiddleware(getToken, setToken));
  }

  return client;
};