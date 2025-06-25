function getDemoFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const data = {
    user: "petar",
    fish: [
      { name: "Starfin", rarity: "Bronze" },
      { name: "Perch", rarity: "Bronze" },
      { name: "Starfin", rarity: "Bronze" },
      { name: "Buttercup Fish", rarity: "Bronze" },
      { name: "Buttercup Fish", rarity: "Bronze" },
      { name: "Starfin", rarity: "Bronze" },
      { name: "Dewfin", rarity: "Bronze" },
      { name: "Lorcan Fish", rarity: "Bronze" },
      { name: "Ianthe", rarity: "Bronze" },
      { name: "Ripplethorn", rarity: "Bronze" },
      { name: "Mistral Koi", rarity: "Silver" },
      { name: "Moonshade Snapper", rarity: "Silver" },
      { name: "Flatfish", rarity: "Bronze" },
      { name: "Chunky Chub", rarity: "Silver" },
      { name: "Whisperbass", rarity: "Silver" },
      { name: "Titan Trout", rarity: "Gold" }
    ]
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

module.exports = { getDemoFish };
