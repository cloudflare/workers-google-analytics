# Workers + Google Analytics Script Helper

This codebase is used to serve a Google Analytics script from your own Workers.dev instance or custom domain. This means that all of your projects' Analytics requests should (ideally) be unblocked since they aren't from a known analytics URL endpoint that uBlock or similar tools are aware of.

To deploy this tool, update `wrangler.toml` with your account ID. By default, the tool will deploy to your workers.dev subdomain, though you can fill out `zone_id` and `route` if you'd like to deploy to a custom domain. By default, the `route` definition just serves this code from `.cloudflare/analytics.js`, meaning you can deploy it on a existing site without clobbering the rest of your application logic.

If you're using this tool with the Workers code in [workers-google-analytics](https://github.com/signalnerve/workers-google-analytics), you should update the corresponding `script` tag to point to your own unique instance of the `analytics.js` file:

```html
<script type="text/javascript" src="https://ga-helper.yoursubdomain.workers.dev/_cf/analytics.js"></script>
```
