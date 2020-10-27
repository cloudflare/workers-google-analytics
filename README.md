# workers-google-analytics

Middleware for proxying Google Analytics pageviews via Workers

## Usage

Install the package and include it in your Cloudflare Workers code. You should pass in a list of origins that will be whitelisted for sending Analytics events to your Google Analytics account.

```sh
$ yarn add workers-google-analytics
```

```js
// index.js

import analytics from 'workers-google-analytics'

const analyticsResp = await analytics(event, {
  allowList: ['bytesized.xyz'],
})
if (analyticsResp) return analyticsResp
```

In the `head` section of your web application, load the script helper and begin sending analytics events:

```html
<script type="text/javascript" src="https://ga-helper.developers.workers.dev/_cf/analytics.js"></script>
<script type="text/javascript">
  const GA_ID = "$YOUR_GA_ID" // In format `UA-123456-7`
  window.ga =
    window.ga ||
    function () {
      if (!GA_ID) {
        return
      }
      ;(ga.q = ga.q || []).push(arguments)
    }
  ga.l = +new Date()
  ga('create', GA_ID, 'auto')
  ga('set', 'transport', 'beacon')
  var timeout = setTimeout(
    (onload = function () {
      clearTimeout(timeout)
      ga('send', 'pageview')
    }),
    1000,
  )
</script>
```

## Custom script helper

The provided script helper deployed at `ga-helper.developers.workers.dev` is an example -- while you _can_ use it in production, we can't promise that it won't eventually be blocked by uBlock and other similar tools.

To mitigate this, the Workers code for that domain is available in the [`helper` directory](https://github.com/signalnerve/workers-google-analytics/tree/main/helper). You can take that code and deploy it to your own workers.dev subdomain (or a custom domain) and use it accordingly.
