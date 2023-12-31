declare global {
  namespace Server {
    /**
     * Shape of the manifest object used to configure the server.
     * It contains the route mappings, middleware mappings, and base URL for the server.
     */
    interface Manifest {
      routes: Route.Mapping;
      middlewares: Middlewares.Mapping;
      baseUrl: string;
    }
  }
}

export {};
