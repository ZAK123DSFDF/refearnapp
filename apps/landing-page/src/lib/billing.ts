// lib/billing.ts
const PRODUCTION_HOSTS = ["refearnapp.com", "www.refearnapp.com"];

export function isProductionHost(): boolean {
  if (typeof window === "undefined") return false;
  return PRODUCTION_HOSTS.includes(window.location.hostname);
}

const CONFIG = {
  sandbox: {
    polar: {
      pro_one_time: "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_X7eHP9MAx6DAlks5YG2hbESbPkybIQHQrcWR92l08hb/redirect",
      ult_one_time: "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_tktd9GGncfqo5ghWFWxIxdSXnuTbyWUUxByTu0K6aQD/redirect",
    },
    paddle: {
      token: "test_4d2d1c25cfaf87a9ec4e6ae9b91",
      env: "sandbox" as const,
      pro_one_time: "pri_01k9sn2zdtx88zc797rb8sy3vn",
      ult_one_time: "pri_01k9sn53nykyx5jc1mwj74b1v2",
    },
  },
  production: {
    polar: {
      pro_one_time: "https://buy.polar.sh/polar_cl_vqVY9K3DlLR6439SLuKSMO1LfizoJvswdzqAA3fTGi8",
      ult_one_time: "https://buy.polar.sh/polar_cl_s8swCILyKa7PMeBYplPcshKjIjim7xTWggcFe3tqauo",
    },
    paddle: {
      token: "live_b47bc9ba47634076b6e568bca05",
      env: "production" as const,
      pro_one_time: "pri_01ke4ckeypze1z13b6tsb914y2",
      ult_one_time: "pri_01ke4cfpjrma8qftd616cahwqc",
    },
  },
};

export const getBillingConfig = () =>
  isProductionHost() ? CONFIG.production : CONFIG.sandbox;
