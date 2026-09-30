import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
});

/**
 * Search Google for a keyword and extract ranking results for a target domain.
 * Scans up to 5 pages (50 results) to find the target domain's position.
 *
 * @param {string} keyword - The search keyword to look up
 * @param {string} targetDomain - The domain to find in search results
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export async function rankTracker(keyword, targetDomain) {
    let browser;
    try {
        // 1. Initialize Browserbase Session & Connect Playwright
        console.log(`[RankTracker] Starting session for keyword="${keyword}" domain="${targetDomain}"`);
        const session = await bb.sessions.create({ browserSettings: { blockAds: true } });
        console.log(`[RankTracker] Session created: ${session.id}`);
        browser = await chromium.connectOverCDP(session.connectUrl);
        const page = browser.contexts()[0].pages()[0];
        page.setDefaultNavigationTimeout(45000);

        // 2. Initial Google Visit & Consent Handling
        await page.goto("https://www.google.com", { waitUntil: "networkidle" });
        console.log(`[RankTracker] Google homepage loaded. Title: "${await page.title()}"`);
        try {
            const btn = await page.$('button[id="L2AGLb"], form[action*="consent"] button');
            if (btn) {
                console.log(`[RankTracker] Consent button found — clicking`);
                await btn.click();
                await page.waitForTimeout(1500);
            }
        } catch { /* ignore consent errors */ }

        let found = null;
        const allResults = [];
        const cleanTarget = targetDomain.replace("www.", "").toLowerCase();

        // 3. Search Loop: Iterate through up to 5 pages of Google results
        for (let gPage = 0; gPage < 5; gPage++) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${gPage * 10}&num=10&hl=en&gl=us`;
            await page.goto(searchUrl, { waitUntil: "networkidle" });
            const pageTitle = await page.title();
            console.log(`[RankTracker] Page ${gPage + 1} loaded. Title: "${pageTitle}"`);

            // 4. CAPTCHA / Bot-block detection — abort early if Google blocked us
            const isCaptcha = await page.evaluate(() => {
                return (
                    document.title.toLowerCase().includes("unusual traffic") ||
                    document.querySelector("form#captcha-form, #recaptcha, .g-recaptcha") !== null ||
                    document.body.innerText.toLowerCase().includes("unusual traffic from your computer network")
                );
            });
            if (isCaptcha) {
                console.error(`[RankTracker] ⚠️ CAPTCHA / bot-block detected on page ${gPage + 1} — aborting`);
                break;
            }

            // 5. Page Extraction: Retry up to 3 times if results are missing
            let pageResults = [];
            for (let retry = 0; retry < 3; retry++) {
                try {
                    await page.waitForSelector("h3", { timeout: 8000 });
                    await page.waitForTimeout(1500);

                    // Diagnostics: how many h3s exist and how many have an anchor parent
                    const diagnostics = await page.evaluate(() => {
                        const allH3 = document.querySelectorAll("h3").length;
                        const h3WithAnchor = Array.from(document.querySelectorAll("h3"))
                            .filter(h => h.closest("a[href]")).length;
                        return { allH3, h3WithAnchor, bodySnippet: document.body.innerText.substring(0, 300) };
                    });
                    console.log(`[RankTracker] Page ${gPage + 1} retry ${retry}: h3s=${diagnostics.allH3}, h3sWithAnchorParent=${diagnostics.h3WithAnchor}`);
                    console.log(`[RankTracker] Body preview: ${diagnostics.bodySnippet.replace(/\n/g, " ")}`);

                    // ── Core extraction ──────────────────────────────────────────────────
                    // Strategy: start from <h3> (the title), then walk UP via
                    // h3.closest('a[href]') to find the parent link.
                    // This is far more reliable than the old approach of
                    // a.querySelector('h3') which breaks when nesting depth varies.
                    pageResults = await page.evaluate(() => {
                        const resolveHref = (raw) => {
                            if (!raw) return null;
                            // Handle /url?q=... and /url?url=... Google redirect patterns
                            if (raw.includes("/url?")) {
                                try {
                                    const u = new URL(raw, location.origin);
                                    raw = u.searchParams.get("q") || u.searchParams.get("url") || raw;
                                } catch { return null; }
                            }
                            if (!raw.startsWith("http")) return null;
                            try {
                                const host = new URL(raw).hostname;
                                if (host.includes("google.") || host.includes("gstatic.") || host.includes("googleapis.")) return null;
                            } catch { return null; }
                            return raw;
                        };

                        const h3s = Array.from(document.querySelectorAll("h3"));
                        const seen = new Set();
                        const results = [];

                        for (const h3 of h3s) {
                            const title = h3.innerText.trim();
                            if (!title) continue;

                            // Walk UP from the <h3> to find its enclosing <a href>
                            const anchor = h3.closest("a[href]");
                            if (!anchor) continue;

                            const href = resolveHref(anchor.href);
                            if (!href || seen.has(href)) continue;
                            seen.add(href);

                            // Extract snippet by climbing the DOM from the anchor
                            let snippet = "";
                            let c = anchor.parentElement;
                            for (let j = 0; j < 8 && c; j++, c = c.parentElement) {
                                const txt = (c.innerText || "").trim();
                                if (txt.length > title.length + 50) {
                                    snippet = (
                                        txt.split("\n").find((l) => l.length > 30 && !l.includes(title.substring(0, 15))) || ""
                                    ).trim().substring(0, 300);
                                    if (snippet) break;
                                }
                            }

                            let domain;
                            try { domain = new URL(href).hostname.replace("www.", "").toLowerCase(); } catch { continue; }

                            results.push({ url: href, domain, title, snippet });
                        }

                        return results;
                    });

                    console.log(`[RankTracker] Page ${gPage + 1} extracted ${pageResults.length} results`);
                    if (pageResults.length > 0) {
                        console.log(`[RankTracker] First result: ${JSON.stringify(pageResults[0])}`);
                        break;
                    }
                    // No results yet — reload and retry
                    console.log(`[RankTracker] 0 results on retry ${retry} — reloading`);
                    await page.reload({ waitUntil: "networkidle" });
                } catch (err) {
                    console.error(`[RankTracker] Page ${gPage + 1} retry ${retry} error: ${err.message}`);
                    if (retry === 2) break;
                    await page.reload({ waitUntil: "networkidle" });
                }
            }

            if (!pageResults.length) {
                console.log(`[RankTracker] No results on page ${gPage + 1} — stopping`);
                break;
            }

            // 5. Result Synthesis: Assign global positions and check for target match
            for (const r of pageResults) {
                r.position = allResults.length + 1;
                allResults.push(r);
                if (
                    !found &&
                    (r.domain.toLowerCase().includes(cleanTarget) || cleanTarget.includes(r.domain.toLowerCase()))
                ) {
                    found = { ...r, page: gPage + 1 };
                    console.log(`[RankTracker] ✅ Target "${cleanTarget}" found at position ${r.position} (page ${gPage + 1})`);
                }
            }

            // Stop scanning if target was already found
            if (found) break;

            // Polite delay between pages to avoid rate-limiting
            await page.waitForTimeout(2000 + Math.random() * 2000);
        }

        // 6. Finalization: Close browser and collect competitor data
        await browser.close();
        console.log(`[RankTracker] Done. totalResultsScanned=${allResults.length}, position=${found?.position ?? "not found"}`);

        const competitors = allResults
            .filter((r) => !r.domain.toLowerCase().includes(cleanTarget) && !cleanTarget.includes(r.domain.toLowerCase()))
            .slice(0, 10);

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position || null,
                page: found?.page || null,
                title: found?.title || "",
                snippet: found?.snippet || "",
                competitors,
                totalResultsScanned: allResults.length,
            },
        };
    } catch (error) {
        console.error("[RankTracker] Fatal error:", error.message);
        if (browser) await browser.close().catch(() => {});
        return { success: false, error: error.message };
    }
}
