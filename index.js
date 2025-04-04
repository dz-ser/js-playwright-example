// Import Playwright
const { chromium } = require("playwright");

// Define the main async function
async function sortHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false }); // Launch browser (non-headless)
  const context = await browser.newContext(); // New browser session
  const page = await context.newPage(); // New page within browser session
  
  await page.goto("https://news.ycombinator.com/newest"); // Go to Hacker News

  const articles = []; // Initialize an empty array for articles
  let currentPage = 1; // Set counter to track pagination

  while (articles.length < 100) { // Only 30 articles available per page due to pagination
    const pageArticles = await page.$$eval(".athing", (rows) => { // Evaluate elements matching .athing class
      return rows.map((row) => { // Mapping rows
        const titleElement = row.querySelector(".titleline a"); // Get title and link
        const ageElement = row.nextElementSibling?.querySelector(".age a"); // Get age
        return { // Construct objects containing articles' title, link, age, age link
          title: titleElement?.innerText || "No title", // Handles cases where title element might be missing or empty
          link: titleElement?.href || "", // Handles cases where title link element might be missing or empty
          age: ageElement?.innerText || "No age", // Handles cases where age element might be missing or empty
          ageLink: ageElement?.href || "", // Handles cases where age link element might be missing or empty
        };
      });
    });

    articles.push(...pageArticles); // Add new articles to the articles array 
    
    if (articles.length >= 100 || !(await page.$(".morelink"))) break; // Break if 100 collected articles or there are no more pages

    
    await page.click(".morelink"); // Click the "More" link to go to the next page
    currentPage++; // Add 1 to Page counter after click
    await page.waitForLoadState("domcontentloaded"); // Wait for DOM complely loaded
  }

  // Trimming articles to the first 100 
  const first100Articles = articles.slice(0, 100);

  // Log and count the sorted results
  console.log("Sorted Articles (Newest to Oldest):");
  first100Articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title} - ${article.age}`);
  });

  // Close browser
 // await browser.close();
}

//Execute the function
(async () => {
  await sortHackerNewsArticles();
})();