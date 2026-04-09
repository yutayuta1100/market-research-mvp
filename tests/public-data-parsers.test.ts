import { describe, expect, it } from "vitest";

import { parseAmazonSearchHtml } from "@/lib/public-data/amazon-search";
import { normalizeSocialSearch } from "@/lib/public-data/social-search";
import { parseYahooAuctionsHtml } from "@/lib/public-data/yahoo-auctions";
import { parseYahooShoppingSearchHtml } from "@/lib/public-data/yahoo-shopping";
import { getWatchTargets } from "@/lib/mock/fixtures";

describe("public-data parsers", () => {
  it("parses an Amazon search result into a ranked product snapshot", () => {
    const snapshots = parseAmazonSearchHtml({
      html: `
        <div data-component-type="s-search-result" data-asin="B0TEST1234">
          <a class="a-link-normal s-no-outline" href="/Sample-Product/dp/B0TEST1234">
            <img class="s-image" alt="Sony WH-1000XM5 Wireless Headphones" src="https://example.com/sony.jpg" />
          </a>
          <span class="a-price"><span class="a-offscreen">￥47,800</span></span>
        </div>
        <div data-component-type="s-search-result" data-asin="B0TEST9999">
          <a class="a-link-normal s-no-outline" href="/Sample-Product/dp/B0TEST9999">
            <img class="s-image" alt="Sony WH-1000XM6 Wireless Headphones" src="https://example.com/sony-xm6.jpg" />
          </a>
          <span class="a-price"><span class="a-offscreen">￥59,800</span></span>
        </div>
      `,
      queryUrl: "https://www.amazon.co.jp/s?k=Sony+WH-1000XM5",
      matchTerms: ["sony", "wh-1000xm5"],
      requiredTerms: ["wh-1000xm5"],
      excludedTerms: ["wh-1000xm6"],
    });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.asin).toBe("B0TEST1234");
    expect(snapshots[0]?.price).toBe(47800);
    expect(snapshots[0]?.matchedTerms).toBe(2);
    expect(snapshots[0]?.source).toBe("amazon");
  });

  it("parses Yahoo Shopping results into buy-side snapshots when Amazon has no usable match", () => {
    const snapshots = parseYahooShoppingSearchHtml({
      html: `
        <a
          href="https://store.shopping.yahoo.co.jp/yamada-denki/1591424015.html"
          data-beacon="_cl_module:rsltlst;targurl:store.shopping.yahoo.co.jp/yamada-denki/1591424015.html;prc:56100;apld_prc:56100;itm_uuid:yamada-denki_1591424015;tname:ソニー ワイヤレス ヘッドホン WH-1000XM5 ブラック;"
        >
          Sony WH-1000XM5
        </a>
        <a
          href="https://store.shopping.yahoo.co.jp/yamada-denki/1593632012.html"
          data-beacon="_cl_module:rsltlst;targurl:store.shopping.yahoo.co.jp/yamada-denki/1593632012.html;prc:64800;apld_prc:64800;itm_uuid:yamada-denki_1593632012;tname:ソニー ワイヤレス ヘッドホン WH-1000XM6 ブラック;"
        >
          Sony WH-1000XM6
        </a>
      `,
      queryUrl: "https://shopping.yahoo.co.jp/search/WH-1000XM5/0/",
      matchTerms: ["sony", "wh-1000xm5"],
      requiredTerms: ["wh-1000xm5"],
      excludedTerms: ["wh-1000xm6"],
    });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.asin).toBe("yamada-denki_1591424015");
    expect(snapshots[0]?.price).toBe(56100);
    expect(snapshots[0]?.source).toBe("yahoo-shopping");
  });

  it("parses Yahoo! Auctions listing cards into sortable market references", () => {
    const listings = parseYahooAuctionsHtml({
      html: `
        <a class="Product__titleLink"
          href="https://page.auctions.yahoo.co.jp/jp/auction/test123"
          data-auction-id="test123"
          data-auction-title="Nintendo Switch 2 本体 新品"
          data-auction-img="https://example.com/switch.jpg"
          data-auction-price="79800">
        </a>
        <a class="Product__titleLink"
          href="https://page.auctions.yahoo.co.jp/jp/auction/test124"
          data-auction-id="test124"
          data-auction-title="Nintendo Switch 2 本体 未開封"
          data-auction-img="https://example.com/switch-2.jpg"
          data-auction-price="81200">
        </a>
        <a class="Product__titleLink"
          href="https://page.auctions.yahoo.co.jp/jp/auction/test125"
          data-auction-id="test125"
          data-auction-title="Nintendo Switch HAC-001 本体"
          data-auction-img="https://example.com/switch-3.jpg"
          data-auction-price="24000">
        </a>
      `,
      matchTerms: ["switch 2", "本体"],
      requiredTerms: ["switch 2"],
      excludedTerms: ["hac-001"],
    });

    expect(listings).toHaveLength(2);
    expect(listings[0]?.matchedTerms).toBeGreaterThan(0);
    expect(listings[0]?.price).toBe(79800);
  });

  it("normalizes indexed public social results into verifiable evidence", () => {
    const target = getWatchTargets("en").find((entry) => entry.candidateSlug === "pokemon-card-151-box");

    if (!target) {
      throw new Error("Expected a seeded Pokemon target.");
    }

    const snapshot = normalizeSocialSearch({
      locale: "en",
      target,
      queryUrl: "https://search.yahoo.co.jp/search?p=Pokemon%20151",
      html: `
        <ol>
          <li>
            <a href="https://www.youtube.com/watch?v=abc123">Pokemon 151 booster box restock watch</a>
            <div><span class="util-Text--sub">2026/4/8</span><span class="util-Delimiter">-</span>Watching Pokemon 151 booster box prices after the latest restock.</div>
            <em>https://www.youtube.com &gt; watch</em>
          </li>
          <li>
            <a href="https://www.reddit.com/r/GameSale/comments/def456/example">Pokemon 151 booster box sale thread</a>
            <div><span class="util-Text--sub">2026/4/7</span><span class="util-Delimiter">-</span>Collectors are comparing prices on sealed 151 booster box listings.</div>
            <em>https://www.reddit.com &gt; r/GameSale</em>
          </li>
        </ol>
      `,
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.metricValue).toBe(2);
    expect(snapshot?.verification.status).toBe("verified");
    expect(snapshot?.evidence).toHaveLength(2);
  });
});
