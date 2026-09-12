
const apiKey = "IVY26-F719CF9B06F8";

const password = "c5b53048af";

async function testApi() {
    console.log("Step 1: Attempting to log in...");

    const loginResponse = await fetch("https://solve.ivy.homes/auth/login", {
        method: "POST",
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: "demo1@ivy.homes",
            password: password
        })
    });

    const loginData = await loginResponse.json();

    if (!loginData.access_token) {
        console.log("Login failed! Here is what the server said:");
        console.log(loginData);
        return;
    }

    console.log("Login successful! We received a token.");
    console.log("Step 2: Fetching listings using the token...");

    const listingsResponse = await fetch("https://solve.ivy.homes/v1/listings", {
        method: "GET",
        headers: {
            "X-API-Key": apiKey,
            "Authorization": `Bearer ${loginData.access_token}`
        }
    });

    const listingsData = await listingsResponse.json();

    console.log("Success! Here is the listing data:");
    console.log(listingsData);
}

testApi();