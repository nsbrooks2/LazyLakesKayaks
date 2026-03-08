import Database from "better-sqlite3";
const db = new Database("lazy-lake.db");
const allReviews = db.prepare("SELECT * FROM reviews").all();
console.log("All Reviews in DB:");
console.log(JSON.stringify(allReviews, null, 2));
