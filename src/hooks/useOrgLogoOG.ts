export function getOrgLogoOG() {
  const svgString = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#A5C8FF"/>
      <stop offset="50%" stop-color="#7B87FF"/>
      <stop offset="100%" stop-color="#6A4CFF"/>
    </linearGradient>
  </defs>
  <rect width="35" height="35" rx="8" ry="8" fill="url(#grad)" />
  <svg x="5" y="5" width="25" height="25" viewBox="0 0 400 388">
    <path fill="#FFFFFF" d="M7308.07,7045.05l-52.08.56a100.35,100.35,0,0,0-19.7-6.43,101.51,101.51,0,0,0-55.14,3.6,99.71,99.71,0,0,0-26.18,14.15,93.14,93.14,0,0,1,76.55-40.94,107.94,107.94,0,0,1,76.55,29.06Z"/>
    <path fill="#FFFFFF" d="M7448.07,7126.88A355.31,355.31,0,0,0,7240.5,7281.1l-46.64-19a251.07,251.07,0,0,0-51.74-54.13,134.23,134.23,0,0,1,77.27,44.94c12.47-21.2,64.06-103.35,160.51-123.24A214.56,214.56,0,0,1,7448.07,7126.88Z"/>
    <path fill="#FFFFFF" d="M7258.63,7282.63c10.51-3.1,38.8-13,60-41.11a114.36,114.36,0,0,0,20.68-46.47l28.59-17.87c-.06,6.15-1.41,54.16-41.36,84.51C7298.53,7283,7268.09,7283,7258.63,7282.63Z"/>
  </svg>
</svg>
`)
  return `data:image/svg+xml,${svgString}`
}
