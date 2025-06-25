function getDemoFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const data = {
    user: "user",
    fish: [
      { name: "fish", rarity: "Bronze" },
      { name: "fish2 ", rarity: "Silver" },
      { name: "fish3", rarity: "Gold" } ,
      { name: "fish4", rarity: "Diamond" } ,
      { name: "fish5", rarity: "Platinum" },
      { name: "fish6", rarity: "Mythical" },
      { name: "fish7", rarity: "Unknown/Other" },
     ]
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

module.exports = { getDemoFish };
