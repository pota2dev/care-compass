const BASE_URL = "http://localhost:1206/api";

async function testEvents() {
  console.log("\n--- Testing Events API ---");
  
  // 1. GET ALL
  console.log("1. GET /events");
  const getListRes = await fetch(`${BASE_URL}/events`);
  const list = await getListRes.json();
  console.log(`Found ${list.length} events.`);
  
  // 2. GET SINGLE
  if (list.length > 0) {
    console.log(`\n2. GET /events/${list[0].id}`);
    const getSingleRes = await fetch(`${BASE_URL}/events/${list[0].id}`);
    const single = await getSingleRes.json();
    console.log(`Retrieved event: ${single.title}`);
  }

  // 3. POST NEW
  console.log("\n3. POST /events");
  const postRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-user-id": "seed_community_1",
    },
    body: JSON.stringify({
      title: "Test Event API",
      category: "OTHER",
      location: "Dhaka",
      city: "Dhaka",
      startDate: new Date().toISOString(),
      isFree: true,
    }),
  });
  const newEvent = await postRes.json();
  if (newEvent.id) {
    console.log(`Created new event with ID: ${newEvent.id}`);
    
    // 4. PUT UPDATE
    console.log(`\n4. PUT /events/${newEvent.id}`);
    const putRes = await fetch(`${BASE_URL}/events/${newEvent.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-test-user-id": "seed_community_1",
      },
      body: JSON.stringify({ title: "Updated Test Event API" }),
    });
    const updatedEvent = await putRes.json();
    console.log(`Updated title: ${updatedEvent.title}`);
    
    // 5. DELETE
    console.log(`\n5. DELETE /events/${newEvent.id}`);
    const delRes = await fetch(`${BASE_URL}/events/${newEvent.id}`, {
      method: "DELETE",
      headers: {
        "x-test-user-id": "seed_community_1",
      },
    });
    const delJson = await delRes.json();
    console.log(`Delete successful: ${delJson.success}`);
  } else {
    console.log("Failed to create event:", newEvent);
  }
}

async function testLostFound() {
  console.log("\n--- Testing Lost & Found API ---");
  
  // 1. GET ALL
  console.log("1. GET /lost-found");
  const getListRes = await fetch(`${BASE_URL}/lost-found`);
  const list = await getListRes.json();
  console.log(`Found ${list.length} reports.`);
  
  // 2. GET SINGLE
  if (list.length > 0) {
    console.log(`\n2. GET /lost-found/${list[0].id}`);
    const getSingleRes = await fetch(`${BASE_URL}/lost-found/${list[0].id}`);
    const single = await getSingleRes.json();
    console.log(`Retrieved report: ${single.description}`);
  }

  // 3. POST NEW
  console.log("\n3. POST /lost-found");
  const postRes = await fetch(`${BASE_URL}/lost-found`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-user-id": "seed_owner_1",
    },
    body: JSON.stringify({
      type: "FOUND",
      species: "Bird",
      description: "Found a green parrot",
      location: "Uttara",
      city: "Dhaka",
    }),
  });
  const newReport = await postRes.json();
  if (newReport.id) {
    console.log(`Created new report with ID: ${newReport.id}`);
    
    // 4. PUT UPDATE
    console.log(`\n4. PUT /lost-found/${newReport.id}`);
    const putRes = await fetch(`${BASE_URL}/lost-found/${newReport.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-test-user-id": "seed_owner_1",
      },
      body: JSON.stringify({ description: "Found a green parrot (updated)" }),
    });
    const updatedReport = await putRes.json();
    console.log(`Updated description: ${updatedReport.description}`);
    
    // 5. DELETE
    console.log(`\n5. DELETE /lost-found/${newReport.id}`);
    const delRes = await fetch(`${BASE_URL}/lost-found/${newReport.id}`, {
      method: "DELETE",
      headers: {
        "x-test-user-id": "seed_owner_1",
      },
    });
    const delJson = await delRes.json();
    console.log(`Delete successful: ${delJson.success}`);
  } else {
    console.log("Failed to create report:", newReport);
  }
}

async function run() {
  try {
    await testEvents();
    await testLostFound();
    console.log("\nAll tests passed successfully!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
