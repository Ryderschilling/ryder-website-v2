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
   rating is out of 5. Use halves if you want: 4.5 works.
   ================================================================== */

window.BOOKS_CONFIG = {
  goal: 52,
  startDate: "2026-09-09",          // day one, book 1 opened
  endDate: "2027-09-08",            // day 365
  tag: "ryderschillin-20",          // Amazon Associates tag
  instagram: "https://www.instagram.com/ryder_schilling_official/",
  handle: "@ryder_schilling_official"
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
    status: "done",                 // reading | done | queued
    started: "2026-09-09",
    finished: "2026-09-16",
    rating: 5,                      // out of 5
    pages: 152,
    tags: ["Business", "Mindset"],
    verdict: "The mental framework and the money split that get you ready for the breakthrough before it shows up.",
    report: "Going from nothing to building your dream life is not easy. What this book gives you is the framework for it: the way you think about money, and a way to manage what you have so you are ready when the big break comes. Myron came up broke and it reads like it, everything in here is written by someone who actually had to climb. The perspective chapters changed how I look at what I earn, and the budget split is the part I started using the same week I read it. Short book, no filler, and it sets you up to maximize whatever you are working with right now.",
    takeaways: [
      "Your perspective is what shapes your finances. Two people can look at the same thing from different angles and see completely different things. Money works exactly the same way.",
      "Pour into your own mind before you let anyone else pour into it. If you cannot afford the life you want, your time cannot afford TV and social media.",
      "Budget for the life you want and for future you at the same time. Myron's split: 10% tithe, 10% invest for later, 10% self education, 10% save for what you want, 10% fun, 50% bills."
    ],
    quote: "If you empty your purse into your mind, your mind will fill your purse with gold.",
    buy: "https://www.amazon.com/gp/product/B001X5YGEM?smid=A2E76B261HPXT3&psc=1&linkCode=ll2&tag=ryderschillin-20&linkId=66d08c76a34a4887c469227087b9a493&language=en_US&gaOptInStatus=true&ref_=as_li_ss_tl"
  },

  {
    n: 2,
    title: "$100M Offers",
    subtitle: "How to Make Offers So Good People Feel Stupid Saying No",
    author: "Alex Hormozi",
    asin: "173747574X",
    cover: "",
    photo: "",
    status: "reading",              // reading | done | queued
    started: "2026-09-16",
    finished: "",
    rating: 0,                      // out of 5, fill when done
    pages: 0,
    tags: ["Business", "Offers"],
    verdict: "",                    // one sentence, shows on the card
    report: "",                     // the paragraph, shows when opened
    takeaways: [],                  // 3 lines max
    quote: "",
    buy: "https://amzn.to/4d4ysVN"
  }

];

/* UP NEXT, in the order you will read them.
   People buy ahead from this list, so every entry needs a buy link. */
window.BOOKS_QUEUE = [
  {
    title: "$100M Leads",
    author: "Alex Hormozi",
    asin: "1737475774",
    buy: "https://amzn.to/4ipLlgs"
  },
  {
    title: "100 Bible Principles for Business",
    author: "Dennis Juan Allen",
    asin: "B0GL2ND3V6",
    buy: "https://amzn.to/4xnP5CU"
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
    rating: 4,
    pages: 0,
    tags: ["Business"],
    verdict: "",
    report: "",
    takeaways: ["", "", ""],
    quote: "",
    buy: ""
  },
------------------------------------------------------------------ */
