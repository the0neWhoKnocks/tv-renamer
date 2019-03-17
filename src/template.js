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
  const _rootContent = (rootContent)
    ? rootContent
    : '<div class="loading-msg">Loading App</div>';
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
          background: #005180;
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          z-index: 10;
        }
        body > noscript > div {
          width: 80%;
          color: #fff;
          text-align: left;
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
          cursor: pointer;
        }
        button:disabled {
          cursor: default;
        }
        #__bs_notify__ {
          opacity: 0.25;
          pointer-events: none;
          transform: translateY(2em);
        }
        .loading-msg {
          text-align: center;
          padding: 0.5em 0.75em 0.5em 0.75em;
          border-radius: 1em;
          background: #fff;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>
      ${ headScripts.join('\n') }
    </head>
    <body>
      ${ noscriptMsg }
      <div id="root">${ _rootContent }</div>
      <div id="modals"></div>
      ${ _bundleScripts }
    </body>
    </html>
  `;
};