const GA_ENDPOINT = `https://www.google-analytics.com/collect`;

const originallowlist: string[] = [];

function allowlistDomain(domain: string, addWww = true) {
  const prefixes = ["https://", "http://"];
  if (addWww) {
    prefixes.push("https://www.");
    prefixes.push("http://www.");
  }
  prefixes.forEach((prefix) => originallowlist.push(prefix + domain));
}

function cid() {
  return String(Math.random() * 1000); // They use a decimal looking format. It really doesn't matter.
}

async function proxyToGoogleAnalytics(event: FetchEvent) {
  // get GA params whether GET or POST request
  const url = new URL(event.request.url);

  const params =
    event.request.method.toUpperCase() === "GET"
      ? url.searchParams
      : new URLSearchParams(await event.request.text());

  const headers = event.request.headers || <Headers>{};

  // attach other GA params, required for IP address since client doesn't have access to it. UA and CID can be sent from client
  params.set("uip",
    headers.get('cf-connecting-ip') || headers.get("x-forwarded-for") || headers.get("x-bb-ip") || ""
  ); // ip override. Look into headers for clients IP address, as opposed to IP address of host running lambda function
  params.set("ua", params.get("ua") || headers.get("user-agent") || ""); // user agent override
  params.set(
    "cid",
    params.get("cid") || cid()
  );

  return fetch(
    new Request(GA_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "image/gif",
      },
      body: params.toString(),
    })
  );
}

export async function proxyToGA(event: FetchEvent) {
  const origin =
    event.request.headers.get("origin") || event.request.headers.get("Origin") || "";

  const isOriginallowlisted = originallowlist.indexOf(origin) >= 0;

  let cacheControl = "no-store";
  const url = new URL(event.request.url);
  if (url.searchParams.get("ec") == "noscript") {
    cacheControl = "max-age: 30";
  }

  const headers = {
    "Access-Control-Allow-Origin": isOriginallowlisted
      ? origin
      : originallowlist[0],
    "Cache-Control": cacheControl,
  };

  try {
    if (event.request.method === "OPTIONS") {
      // CORS (required if you use a different subdomain to host this function, or a different domain entirely)
      return new Response(null, { status: 204, headers: headers });
    } else if (!origin || isOriginallowlisted) {
      return proxyToGoogleAnalytics(event);
    } else {
      return new Response(null, { status: 401 });
    }
  } catch (err) {
    return new Response(err.toString(), { status: 500 })
  }
}

export default async (event: FetchEvent, { allowList }: { allowList: string[] }): Promise<void | Response> => {
  allowList.forEach(origin => allowlistDomain(origin))
  const url = new URL(event.request.url)
  if (url.pathname.includes(".cloudflare/ga")) return proxyToGA(event)
}