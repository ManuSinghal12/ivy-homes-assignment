const fs = require('fs');

function runAnalysis() {
    console.log("Loading data...");
    const rawData = fs.readFileSync('listings.json', 'utf8');
    const listings = JSON.parse(rawData);

    const activeListings = listings.filter(l => l.is_live === true);
    console.log(`Q1 Total Listings: ${listings.length}`);
    console.log(`Q3 Active Listings: ${activeListings.length}`);


    const uniquePropertyKeys = new Set();
    const duplicateRecords = [];

    listings.forEach(l => {

        const propertySignature = `${l.latitude}_${l.longitude}_${l.floor}_${l.bedroom}_${l.carpet_area}`;

        if (uniquePropertyKeys.has(propertySignature)) {
            duplicateRecords.push(l.listing_id);
        } else {
            uniquePropertyKeys.add(propertySignature);
        }
    });

    console.log("---");
    console.log(`Q2 Answer (unique_properties): ${uniquePropertyKeys.size}`);
    console.log(`Duplicate Listing Records Found: ${duplicateRecords.length}`);
    console.log("---");

    const duplicatesMap = {};
    listings.forEach(l => {
        const sig = `${l.latitude}_${l.longitude}_${l.floor}_${l.bedroom}_${l.carpet_area}`;
        if (!duplicatesMap[sig]) duplicatesMap[sig] = [];
        duplicatesMap[sig].push(l.listing_id);
    });

    const sampleDuplicates = Object.values(duplicatesMap).find(ids => ids.length > 1);
    console.log("Evidence sample duplicate listing IDs:", sampleDuplicates.slice(0, 3));
}

runAnalysis();