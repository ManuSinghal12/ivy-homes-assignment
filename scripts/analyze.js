const fs = require('fs');

function runAnalysis() {
    console.log("Loading data...");
    const rawData = fs.readFileSync('listings.json', 'utf8');
    const listings = JSON.parse(rawData);

    console.log(`Loaded ${listings.length} total listings.`);


    const activeListings = listings.filter(listing => listing.is_live === true);


    const inactiveListings = listings.filter(listing => listing.is_live === false);

    console.log("---");
    console.log(`Q3 Answer (active_listings): ${activeListings.length}`);
    console.log(`Hidden Lie Check (inactive listings found): ${inactiveListings.length}`);
    console.log("---");
    console.log("Evidence (First 5 inactive listing IDs):", inactiveListings.slice(0, 5).map(l => l.listing_id));
}

runAnalysis();