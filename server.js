import express from "express";
import fs from "fs";
import csv from "csv-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let papers = [];

// Load CSV data
fs.createReadStream("Research_Papers_with_Keywords.csv")
  .pipe(csv())
  .on("data", (row) => {
    // Split keywords into an array
    row.Keywords = row.Keywords
      ? row.Keywords.split(",").map((k) => k.trim().toLowerCase())
      : [];
    papers.push(row);
  })
  .on("end", () => {
    console.log("CSV data loaded successfully.");
  });

// Get all available keywords
app.get("/api/keywords", (req, res) => {
  const allKeywords = [...new Set(papers.flatMap((p) => p.Keywords))];
  res.json(allKeywords);
});

// Get papers by keyword
app.get("/api/papers", (req, res) => {
  const keyword = req.query.keyword?.toLowerCase();
  if (!keyword) {
    return res
      .status(400)
      .json({ error: "Please provide a keyword query parameter" });
  }

  const filtered = papers.filter((p) => p.Keywords.includes(keyword));
  res.json(filtered);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
