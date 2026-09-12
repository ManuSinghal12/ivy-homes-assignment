const fs = require('fs');

const apiKey = "IVY26-F719CF9B06F8";
const password = "c5b53048af";

async function runCompleteAnalysis() {
    const listings = JSON.parse(fs.readFileSync('listings.json', 'utf8'));
    console.log(`Loaded ${listings.length} listings from local file.`);

    // --- 1. AUTHENTICATE ---
    const loginRes = await fetch("https://solve.ivy.homes/auth/login", {
        method: "POST",
        headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo1@ivy.homes", password: password })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;

    if (!token) {
        console.error("Login failed! Check your API key and password.");
        return;
    }

    // --- 2. FETCH ALL PROJECTS WITH PAGINATION ---
    console.log("\nFetching all projects from /v1/projects...");
    let allProjects = [];
    let offset = 0;
    const limit = 50;

    while (true) {
        const projRes = await fetch(`https://solve.ivy.homes/v1/projects?offset=${offset}&limit=${limit}`, {
            headers: { "X-API-Key": apiKey, "Authorization": `Bearer ${token}` }
        });
        const data = await projRes.json();
        const results = data.results || [];
        allProjects = allProjects.concat(results);

        if (allProjects.length >= data.total || results.length === 0 || !data.has_more) {
            break;
        }
        offset += limit;
    }

    console.log(`Fetched total ${allProjects.length} projects.`);

    // --- 3. AUDIT PROJECT LISTING COUNT DISCREPANCIES ---
    const localProjectCounts = {};
    listings.forEach(l => {
        if (l.project_id) {
            localProjectCounts[l.project_id] = (localProjectCounts[l.project_id] || 0) + 1;
        }
    });

    let projectsWithWrongCount = 0;
    const mismatchedProjectIds = [];

    allProjects.forEach(p => {
        const pid = p.project_id;
        const reportedCount = p.total_listings;
        const actualCount = localProjectCounts[pid] || 0;

        if (reportedCount !== undefined && reportedCount !== actualCount) {
            projectsWithWrongCount++;
            mismatchedProjectIds.push({ pid, reported: reportedCount, actual: actualCount });
        }
    });

    console.log("---");
    console.log(`Q10 Answer (projects_with_wrong_listing_count): ${projectsWithWrongCount}`);
    console.log("Sample project count mismatches:", mismatchedProjectIds.slice(0, 3));

    // --- 4. DETAILED SCAN FOR CORRUPT & FAKE LISTINGS ---
    const corruptIds = [];
    const fakeIds = [];

    listings.forEach(l => {
        // Corrupt checks: illogical structural data
        const isCorruptDate = isNaN(new Date(l.posted_at).getTime());
        const isCorruptFloors = l.floor > l.total_floors && l.total_floors > 0;
        const isCorruptArea = l.carpet_area <= 0 || (l.super_built_up_area > 0 && l.carpet_area > l.super_built_up_area);
        const isCorruptPrice = l.price <= 0;

        if (isCorruptDate || isCorruptFloors || isCorruptArea || isCorruptPrice) {
            corruptIds.push(l.listing_id);
        }

        // Fake checks: bot/spam markers in contact or poster fields
        const contactStr = String(l.posted_by_contact || "");
        const nameStr = String(l.posted_by_name || "").toLowerCase();
        const isFakeContact = contactStr.includes("000000") || contactStr.includes("123456");
        const isFakeName = nameStr.includes("test") || nameStr.includes("dummy") || nameStr.includes("fake");

        if (isFakeContact || isFakeName) {
            fakeIds.push(l.listing_id);
        }
    });

    console.log("---");
    console.log(`Corrupt Listing IDs (${corruptIds.length}):`, corruptIds);
    console.log(`Fake Listing IDs (${fakeIds.length}):`, fakeIds);
    console.log("---");
}

runCompleteAnalysis();