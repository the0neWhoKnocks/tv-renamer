export default ({
  bundleScripts,
  rootContent,
  scripts,
  title,
}) => {
  const noscriptMsg = (!rootContent)
    ? `<noscript>
        <div>
          You need to enable JavaScript to run this App.
        </div>
      </noscript>`
    : '';
  const _bundleScripts = (bundleScripts)
    ? bundleScripts.map((script) => `<script type="text/javascript" src="${ script }"></script>`).join('\n')
    : '';
  const headScripts = scripts.head.map(
    (src) => `<script type="text/javascript" src="${ src }"></script>`
  );
  
  return `
    <html>
    <head>
      <title>${ title }</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
      <link rel="apple-touch-icon" sizes="180x180" href="/imgs/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/imgs/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/imgs/favicon-16x16.png">
      <link rel="manifest" href="/imgs/site.webmanifest">
      <link rel="mask-icon" href="/imgs/safari-pinned-tab.svg" color="#5bbad5">
      <link rel="shortcut icon" href="/imgs/favicon.ico">
      <meta name="apple-mobile-web-app-title" content="TV Renamer">
      <meta name="application-name" content="TV Renamer">
      <meta name="msapplication-TileColor" content="#00aba9">
      <meta name="msapplication-config" content="/imgs/browserconfig.xml">
      <meta name="theme-color" content="#a3c3e4">
      
      <style>
        *, *::before, *::after {
          box-sizing: border-box;
        }
        html, body {
          padding: 0;
          margin: 0;
        }
        body {
          font-family: Helvetica, Arial, sans-serif;
          background: #eee;
        }
        body > noscript {
          font-size: 1.2em;
          font-weight: bold;
          text-align: center;
          padding: 1em;
          background: #80003b;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }
        body > noscript > div {
          width: 80%;
          color: #fff;
          text-shadow: 0px 2px 2px #000;
          display: inline-block;
        }
        code {
          padding: 0.1em 0.5em;
          border-radius: 0.25em;
          margin-bottom: -1px;
          background: #00000020;
          display: inline-block;
          vertical-align: top;
        }
        button {
          font-size: 1em;
          cursor: pointer;
          padding: 0.5em 1em;
          border: solid 1px #333;
          border-radius: 0.25em;
          background: transparent;
        }
        button:disabled {
          cursor: default;
        }
        button:not(:disabled):hover {
          color: #fff;
          background: #333;
        }
        #__bs_notify__ {
          opacity: 0.25;
          pointer-events: none;
          transform: translateY(2em);
        }
        .loading-msg {
          text-align: center;
          padding: 0.5em 0.75em 0.5em 0.75em;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .loading-msg__logo {
          width: 10em;
          height: 10em;
          color: #314779;
        }
      </style>
      ${ headScripts.join('\n') }
    </head>
    <body>
      <svg style="position:absolute" width="0" height="0">
        <defs>
          <filter id="dropShadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10"/> <!-- stdDeviation is how much to blur -->
            <feOffset dx="25" dy="25" result="offsetblur"/> <!-- how much to offset -->
            <feComponentTransfer>
              <feFuncA type="linear" slope="1"/> <!-- slope is the opacity of the shadow -->
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/> <!-- this contains the offset blurred image -->
              <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
            </feMerge>
          </filter>
          
          <linearGradient id="tmdbGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(90)">
            <stop offset="0%" style="stop-color:#90CEA1; stop-opacity:1"/>
            <stop offset="50%" style="stop-color:#3CBEC9; stop-opacity:1"/>
            <stop offset="100%" style="stop-color:#00B3E5; stop-opacity:1"/>
          </linearGradient>
        </defs>
        
        <symbol id="ui-icon_logo" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M325.3 30.5c-5 2.2-5.8 3.2-5.4 6.2.1.7 9.9 22.3 21.7 48l21.5 46.8-2.3 1.5c-1.3.8-4.5 3.6-7.3 6.3l-5 5-96.5.2c-53.1.1-107.7.7-121.5 1.3-72.2 3.3-94.2 4.5-96.5 5.6-2.2 1-2.6 1.9-3.2 8.1-1.2 13.1-2.8 40.9-3.9 71.5-1.3 34.2-.6 143.4 1 172 2.5 42.8 3.3 52.5 4.5 53.8 1.2 1.2 22.1 3.1 34.9 3.2H72v12c0 10.8.2 12 1.9 13 2.7 1.4 357.5 1.4 360.2 0 1.7-1 1.9-2.2 1.9-13v-12h4.8c12.7-.1 33.6-2 34.8-3.2 2.8-2.9 6.4-89.5 6.4-154.3 0-68.5-3.5-147.3-6.6-150.5-1.1-1.2-7.4-1.8-29.3-3l-27.8-1.5-4.6-5.7-4.6-5.7 38.4-48c21.2-26.5 38.5-49 38.5-50 0-2.5-8.3-9.4-10.7-8.9-1 .2-19.5 22.3-41.1 49.3l-39.2 49-7.8-.3c-4.2-.2-8-.7-8.3-1-.4-.4-10.4-22.1-22.4-48.2-19.5-42.4-23.4-50.2-25.4-49.9-.3 0-3 1.1-5.8 2.4zm-66.3 164c20.3.6 46 2.5 71 5.1 17.2 1.8 20 2.8 24.2 8.5 1.8 2.4 4.7 18.4 3.5 19.5-.2.3-2.4-.1-4.8-.7-3-.8-19.5-1.3-51.6-1.6l-47.3-.4v166.4l48.3-.6c26.5-.4 49.7-1 51.5-1.3l3.2-.6v4.2c0 5.7-2.6 10.7-7 13.6-3.1 2.1-6.1 2.8-16.6 3.9-77 8.5-156.8 8.5-233.7 0-20.8-2.3-22.3-3.8-24.4-26.4l-1.5-15.6 2.7-7.8 2.8-7.7h67.4l7 18.7 7.1 18.8 18.1.3 18.1.2-1.3-3.2c-.7-1.8-15.7-39.2-33.2-83.1L130.6 225H94.5l-11 28.8C76.1 273 72.4 281.7 72.1 280c-.4-3.2 1.7-39.7 3.4-56.3 1.9-19.9 3.8-21.6 27.2-24 29.7-3.1 54.8-4.9 81.8-5.6 26.2-.8 35.8-.7 74.5.4zM448.5 252v3.5l-27.2.3-27.3.2v-8l27.3.2 27.2.3v3.5zm-105.3 2.8c6.7 3.3 9.3 7.9 9.3 16.3s-3.1 13.5-10.2 17c-4.6 2.3-5.8 2.4-30 2.7l-25.3.4v-39.3l25.8.3c24.5.3 25.9.4 30.4 2.6zm-218.9 39.7l11.3 30-22.5.3c-12.3.1-22.6 0-22.8-.2-.3-.2 4.3-13.4 10-29.3 12.7-34.9 12-32.9 12.4-31.7.2.5 5.5 14.4 11.6 30.9zm324.2-18v4l-27.2.3-27.3.2v-3.8c0-2.1.3-4.2.7-4.5.4-.4 12.6-.6 27.2-.5l26.6.3v4zm.3 24.7c.3 3.2 0 3.8-2 4.3-1.3.3-13.5.4-27.3.3l-25-.3-.3-4.3-.3-4.2 27.3.2 27.3.3.3 3.7zM344 320.5c6.6 2.1 12.3 7.4 13.9 13 3.4 12.2-1 22.5-11.4 27.2-3.4 1.5-7.8 1.8-31.7 2.1l-27.8.4v-45.5l25.8.6c20.1.4 26.9.9 31.2 2.2zm103.8 1.4c.8.5 1.2 2.2 1 4.2l-.3 3.4-27.2.3-27.3.2v-3.8c0-2.1.3-4.2.7-4.5.9-1 51.6-.8 53.1.2zm.7 28.6v4h-54l-.3-4.3-.3-4.2 27.3.2 27.3.3v4z"/>
          <path fill="currentColor" d="M184.3 208.1c-2.2 2.2-1.6 5.8 1 6.3 14.6 3 19.4 5.9 23.6 14.1l2.6 4.9.3 34.3.3 34.3h-5.5c-4.5 0-5.7.4-6.6 2-.8 1.4-.8 2.6 0 4 .9 1.6 2.1 2 6.6 2h5.5l-.3 34.3-.3 34.3-2.6 4.9c-4.2 8.2-9 11.1-23.6 14.1-1.6.3-2.3 1.2-2.3 2.8 0 3.7 2.3 4.9 7.7 4.2 8.7-1.3 17.1-6.4 23.1-14.1 2.2-2.7 2.4-2.8 3.4-1.2 4.3 7.8 15.9 14.8 24.9 15.1 3.9.1 5.4-.3 6.3-1.6 1.9-3-.5-5.2-6.3-6-6.9-1-12.1-3.8-16.3-8.8-5.5-6.4-5.8-8.4-5.8-44.8v-33.1l5.1-.3c5.9-.3 8.2-2.5 6.3-5.6-.8-1.2-2.7-1.8-6.3-2l-5.1-.3v-33.1c0-36.4.3-38.4 5.8-44.8 4.2-5 9.4-7.8 16.3-8.8 5.8-.8 8.2-3 6.3-6-.9-1.3-2.4-1.7-6.3-1.6-9 .3-20.6 7.3-24.9 15.1-1 1.6-1.2 1.5-3.4-1.2-3.8-5-8-8.4-13.4-11.1-6.1-3-14.3-4.2-16.1-2.3z"/>
        </symbol>
        <symbol id="ui-icon_folder" viewBox="0 90 612 612" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffa500" style="filter: url(#dropShadow); fill: var(--folder-color, #ffa500)" d="M16.514 595.966h472.284c7.46 0 13.992-5.002 15.934-12.198L612 344.681c0-10.436-5.064-20.818-15.933-20.818h-78.378v-43.69c0-10.098-8.188-18.275-18.275-18.275H263.793l-52.758-73.862H18.275C8.188 188.035 0 196.212 0 206.31v362.854s-2.639 26.802 16.514 26.802z"/>
          <path fill="#FFF" fill-opacity="0.5" d="M488.798 595.966H16.514c-10.869 0-18.772-10.32-15.933-20.819L107.849 336.06c1.941-7.196 8.473-12.198 15.933-12.198h472.285c10.868 0 15.933 10.383 15.933 20.818L504.731 583.768c-1.941 7.196-8.473 12.198-15.933 12.198z"/>
        </symbol>
        <symbol id="ui-icon_refresh" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M9 13.5c-2.49 0-4.5-2.01-4.5-4.5S6.51 4.5 9 4.5c1.24 0 2.36.52 3.17 1.33L10 8h5V3l-1.76 1.76C12.15 3.68 10.66 3 9 3 5.69 3 3.01 5.69 3.01 9S5.69 15 9 15c2.97 0 5.43-2.16 5.9-5h-1.52c-.46 2-2.24 3.5-4.38 3.5z"/>								
        </symbol>
        <symbol id="ui-icon_delete" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
        </symbol>
        <symbol id="ui-icon_tmdb" viewBox="0 0 40 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="url(#tmdbGradient)" width="40" height="18">
            <path d="M37.75 17.25q.5 0 .85-.4.4-.35.4-.85t-.4-.9q-.35-.35-.85-.35H2.25q-.5 0-.9.35-.35.4-.35.9t.35.85q.4.4.9.4h35.5z"/>
            <path d="M8.45 3V1.05H.7V3h2.8v7.9h2.2V3h2.75z"/>
            <path d="M20.6 10.9V1.05h-3.25l-2.3 6.5-2.3-6.5H9.5v9.85h2.1V3.4h.1l2.45 7.5h1.7l2.55-7.5v7.5h2.2z"/>
            <path d="M30.85 6.05q.05-1.15-.45-2.3-.45-.9-1.25-1.5-.85-.6-1.85-.85-1.15-.25-2.25-.25H21.8v9.8h3.55q1.05 0 2.05-.35 1-.25 1.8-.9.75-.6 1.2-1.5.5-1 .45-2.15M26.5 3.3q.6.2 1.05.55.55.3.75.85.3.6.3 1.25 0 .75-.3 1.4-.2.55-.75.95-.5.35-1.1.5-.75.15-1.4.15H23.9v-5.8h1.3q.7 0 1.3.15z"/>
            <path d="M37.75 1.6q-.55-.3-1.15-.35-.6-.1-1.3-.1h-3.65v9.8h4.05q.65 0 1.3-.15.65-.1 1.15-.45.6-.3.9-.85.35-.55.35-1.3 0-.45-.15-.9-.2-.4-.45-.7-.3-.3-.7-.55-.4-.15-.9-.25.75-.25 1.25-.8.5-.6.5-1.4 0-.65-.35-1.3-.3-.45-.85-.7m-1.1 1.9q.1.2.1.5 0 .2-.1.5-.1.15-.35.35-.15.1-.4.15-.25.05-.5.05h-1.55v-2.1h1.45q.25 0 .5.05.3.05.5.15.2.1.35.35m-2.8 5.6V6.9h2.2q.3.05.55.2.3.1.45.3.15.25.15.6 0 .25-.1.5-.1.2-.35.4-.2.15-.5.15-.2.05-.5.05h-1.9z"/>
          </g>
        </symbol>
        <symbol id="ui-icon_thumbnail" viewBox="0 0 550 550" xmlns="http://www.w3.org/2000/svg">
          <path d="M515.828 61.201H34.972C15.659 61.201 0 76.859 0 96.172V454.63c0 19.312 15.659 34.97 34.972 34.97h480.856c19.314 0 34.973-15.658 34.973-34.971V96.172c0-19.313-15.658-34.971-34.973-34.971zm0 34.971V350.51l-68.92-62.66c-10.359-9.416-26.289-9.04-36.186.866l-69.752 69.741-137.532-164.278c-10.396-12.415-29.438-12.537-39.99-.271L34.972 343.219V96.172h480.856zm-148.627 91.8c0-26.561 21.523-48.086 48.084-48.086 26.562 0 48.086 21.525 48.086 48.086s-21.523 48.085-48.086 48.085c-26.56.001-48.084-21.524-48.084-48.085z"/>
        </symbol>
      </svg>
      
      ${ noscriptMsg }
      <div class="loading-msg">
        <svg class="loading-msg__logo">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ui-icon_logo"></use>
        </svg>
      </div>
      <div id="root">${ rootContent || '' }</div>
      <div id="modals"></div>
      ${ _bundleScripts }
    </body>
    </html>
  `;
};