const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const website = "https://www.centreforsight.net";
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const parser = new xml2js.Parser(/* options */);

function getOpportunities(audits) {
  const PASS_THRESHOLD = 0.9;
  const RATINGS = {
    PASS: { label: "pass", minScore: PASS_THRESHOLD },
    AVERAGE: { label: "average", minScore: 0.5 },
    FAIL: { label: "fail" },
    ERROR: { label: "error" },
  };

  function showAsPassed(audit) {
    switch (audit.scoreDisplayMode) {
      case "manual":
      case "notApplicable":
        return true;
      case "error":
      case "informative":
        return false;
      case "numeric":
      case "binary":
      default:
        return Number(audit.score) >= RATINGS.PASS.minScore;
    }
  }

  let opportunities = [];

  opportunities = Object.keys(audits)
    .map((key) => audits[key])
    .map((item) => ({
      title: item.title,
      description: item.description,
      score: item.score,
      scoreDisplayMode: item.scoreDisplayMode,
      displayValue: item.displayValue,
      type: item.details && item.details.type,
    }));

  opportunities = opportunities.filter(
    (audit) => !showAsPassed(audit) && audit.type === "opportunity"
  );
  return opportunities;
}

const getMetrics = (json) => {
  const lighthouse = json.lighthouseResult;
  const lighthouseMetrics = {
    "First Contentful Paint":
      lighthouse.audits["first-contentful-paint"].displayValue,
    "Speed Index": lighthouse.audits["speed-index"].displayValue,
    "Time To Interactive": lighthouse.audits["interactive"].displayValue,
    "First Meaningful Paint":
      lighthouse.audits["first-meaningful-paint"].displayValue,
    "First CPU Idle": lighthouse.audits["first-cpu-idle"].displayValue,
    "Estimated Input Latency":
      lighthouse.audits["estimated-input-latency"].displayValue,
  };
  return lighthouseMetrics;
};

const main = async (website) => {
  let axios_resp = await axios.get(website + "/sitemap.xml");
  let sitemap_xml = axios_resp.data;
  let result = await parser.parseStringPromise(sitemap_xml);
  let urls = result.urlset.url.map((url) => {
    return url.loc[0];
  });
  let report = [];
  const LinkLoop = (i, cb) => {
    if (i < urls.length) {
      let url = urls[i];
      axios
        .get(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&&strategy=desktop&&key=${process.env.PAGES_SPEED_KEY}`
        )
        .then((desktopRes) => {
          axios
            .get(
              `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&&strategy=mobile&&key=${process.env.PAGES_SPEED_KEY}`
            )
            .then((mobileRes) => {
              report.push({
                desktop: {
                  score:
                    desktopRes.data.lighthouseResult.categories.performance
                      .score * 100,
                  stats: getMetrics(desktopRes.data),
                  opportunities: getOpportunities(
                    desktopRes.data.lighthouseResult.audits
                  ),
                },
                mobile: {
                  score:
                    mobileRes.data.lighthouseResult.categories.performance
                      .score * 100,
                  stats: getMetrics(mobileRes.data),
                  opportunities: getOpportunities(
                    mobileRes.data.lighthouseResult.audits
                  ),
                },
              });
              setTimeout(LinkLoop(i + 1, cb), 60 * 1000);
            });
        })
        .catch((err) => cb(err, null));
    } else {
      cb(null, report);
    }
  };

  LinkLoop(0, (err, _) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + "/report.json", JSON.stringify(_));
    console.log(
      "Report Generated in " +
        ((Date.now() - startTime) / 1000) * 60 +
        " minutes"
    );
  });
};

let startTime = Date.now();

main(website)
  .then((_) => {
    console.log("Completed");
  })
  .catch((err) => console.error(err));
