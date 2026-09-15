/* ==================================================================
   52 BOOKS IN A YEAR . DATA FILE
   This is the only file you edit each week. Nothing else.

   HOW TO ADD A BOOK YOU FINISHED
   1. Find its object below (or copy the TEMPLATE at the bottom).
   2. status: "done", fill finished, rating, verdict, report, takeaways.
   3. Save. Push. The page rebuilds itself.

   COVERS: either drop a jpg in /assets/books/ and set cover,
   or just set asin and Amazon serves the cover automatically.
   photo = your own shot of the book (optional, used on the feature).
   rating is out of 10. Use halves if you want: 8.5 works.
   ================================================================== */

window.BOOKS_CONFIG = {
  goal: 52,
  startDate: "2026-09-09",          // day one, book 1 opened
  endDate: "2027-09-08",            // day 365
  tag: "ryderschillin-20",          // Amazon Associates tag
  instagram: "https://www.instagram.com/ryderschillingofficial/",
  handle: "@ryderschillingofficial"
};

window.BOOKS = [

  {
    n: 1,
    title: "From the Trash Man to the Cash Man",
    subtitle: "How Anyone Can Get Rich Starting From Anywhere",
    author: "Myron Golden",
    asin: "B001X5YGEM",
    cover: "/assets/books/01-trash-man.jpg",
    photo: "/assets/books/01-trash-man-photo.jpg",
    status: "reading",              // reading | done | queued
    started: "2026-09-09",
    finished: "",
    rating: 0,                      // out of 10, fill when done
    pages: 152,
    tags: ["Business", "Mindset"],
    verdict: "",                    // one sentence, shows on the card
    report: "",                     // the paragraph, shows when opened
    takeaways: [],                  // 3 lines max
    quote: "",
    buy: "https://www.amazon.com/gp/product/B001X5YGEM?smid=A2E76B261HPXT3&psc=1&linkCode=ll2&tag=ryderschillin-20&linkId=66d08c76a34a4887c469227087b9a493&language=en_US&gaOptInStatus=true&ref_=as_li_ss_tl"
  }

];

/* UP NEXT, in the order you will read them.
   People buy ahead from this list, so every entry needs a buy link. */
window.BOOKS_QUEUE = [
  {
    title: "100 Bible Principles for Business",
    author: "Dennis Juan Allen",
    asin: "B0GL2ND3V6",
    buy: "https://amzn.to/4xnP5CU"
  },
  {
    title: "$100M Offers",
    author: "Alex Hormozi",
    asin: "173747574X",
    buy: "https://amzn.to/4d4ysVN"
  },
  {
    title: "$100M Leads",
    author: "Alex Hormozi",
    asin: "1737475774",
    buy: "https://amzn.to/4ipLlgs"
  }
];

/* ------------------------------------------------------------------
   TEMPLATE . copy this block, paste it at the TOP of window.BOOKS
   ------------------------------------------------------------------
  {
    n: 2,
    title: "",
    subtitle: "",
    author: "",
    asin: "",
    cover: "",
    photo: "",
    status: "done",
    started: "2026-10-08",
    finished: "2026-10-14",
    rating: 8,
    pages: 0,
    tags: ["Business"],
    verdict: "",
    report: "",
    takeaways: ["", "", ""],
    quote: "",
    buy: ""
  },
------------------------------------------------------------------ */
