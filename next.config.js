// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: { unoptimized: true },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out the output: 'export' line
  // output: 'export', // This prevents dynamic API routes
  
  // If you still want some static export features, use:
  // trailingSlash: true,
  // images: {
  //   unoptimized: true,
  // },
}

module.exports = nextConfig;