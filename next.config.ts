import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: {},
    experimental: {
        serverActions: {
            allowedOrigins: [
                'mededuai.com', 
                '*.mededuai.com', 
                'mededuai-backend-614060855173.asia-south1.run.app'
            ]
        }
    }
};

export default nextConfig;
