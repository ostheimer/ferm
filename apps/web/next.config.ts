import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/ansitze",
        destination: "/app/ansitze",
        permanent: false
      },
      {
        source: "/fallwild",
        destination: "/app/fallwild",
        permanent: false
      },
      {
        source: "/protokolle",
        destination: "/app/protokolle",
        permanent: false
      },
      {
        source: "/protokolle/:id",
        destination: "/app/protokolle/:id",
        permanent: false
      },
      {
        source: "/reviereinrichtungen",
        destination: "/app/reviereinrichtungen",
        permanent: false
      },
      {
        source: "/sitzungen",
        destination: "/app/sitzungen",
        permanent: false
      },
      {
        source: "/sitzungen/:id",
        destination: "/app/sitzungen/:id",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
