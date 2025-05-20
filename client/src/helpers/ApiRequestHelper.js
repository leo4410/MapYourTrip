export async function uploadZip(BE_URL, formData) {
  try {
    const response = await fetch(`${BE_URL}/upload/zip`, {
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

export async function loadTrips(BE_URL) {
  try {
    const response = await fetch(`${BE_URL}/trips`, {
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
