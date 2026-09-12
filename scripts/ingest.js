const fs = require('fs');

const apiKey = "IVY26-F719CF9B06F8";
const password = "c5b53048af";

async function ingestData() {
    console.log("1. Authenticating...");
    const loginRes = await fetch("https://solve.ivy.homes/auth/login", {
        method: "POST",
        headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo1@ivy.homes", password: password })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;

    console.log("2. Fetching all listings...");
    let allListings = [];
    let page = 1;
    const limit = 200;

    while (true) {
        console.log(`Fetching page ${page}...`);
        const res = await fetch(`https://solve.ivy.homes/v1/listings?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: { "X-API-Key": apiKey, "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        allListings = allListings.concat(data.results);

        if (allListings.length >= data.total || data.results.length === 0) {
            break;
        }
        page++;
    }

    console.log(`Finished! Downloaded ${allListings.length} total listings.`);

    console.log("3. Saving to local file...");
    fs.writeFileSync('listings.json', JSON.stringify(allListings, null, 2));
    console.log("Data successfully saved to listings.json!");
}

ingestData();