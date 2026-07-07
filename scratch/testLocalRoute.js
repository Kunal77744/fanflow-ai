async function test() {
  try {
    const response = await fetch("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
        "Host": "localhost:3000"
      },
      body: JSON.stringify({
        message: "hello from scratch test",
        seatSection: "109",
        accessibilityMode: false
      })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

test();
