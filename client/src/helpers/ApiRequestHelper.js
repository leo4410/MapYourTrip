export async function uploadZip(formData) {
  try {
    const response = await fetch("http://localhost:8000/upload/zip", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("failed to upload uip to api");
    }
    return response.json();
  } catch (error) {
    console.error("failed to upload uip to api: ", error);
  }
}

export async function loadTrips() {
  try {
    const response = await fetch("http://localhost:8000/trips", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("failed to load trips from api");
    }
    return response.json();
  } catch (error) {
    console.error("failed to load trips from api: ", error);
  }
}
