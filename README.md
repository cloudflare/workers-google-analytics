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
<script type="text/javascript" src="https://ga-helper.developers.workers.dev/analytics.js"></script>
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
