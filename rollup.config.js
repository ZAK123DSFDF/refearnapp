import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
const isProd = process.env.NODE_ENV === "production"
export default {
  input: "public/affiliateTracking.ts",
  output: {
    file: isProd
      ? "public/affiliateTrackingJavascript.js"
      : "public/affiliateTrackingJavascript.dev.js",
    format: "iife",
    name: "AffiliateTracker",
    sourcemap: false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.CLOUDFLARE_URL": JSON.stringify(
        isProd
          ? "https://tracking-worker.zekariyasberihun8.workers.dev"
          : "https://tracking-worker-dev.zekariyasberihun8.workers.dev"
      ),
    }),
    nodeResolve(),
    commonjs(),
    typescript(),
    isProd && terser(),
  ],
}
