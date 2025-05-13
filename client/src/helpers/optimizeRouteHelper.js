export const optimizeRoute = async (
  BE_URL,
  selectedSegment,
  selectedTransport,
  segmentLayerRef,
  setPopupMode
) => {
  if (!selectedSegment) {
    return alert("Kein Segment ausgewählt!");
  }

  const rawId = selectedSegment.getId();
  const segmentId = rawId.includes(".") ? rawId.split(".").pop() : rawId;
  const url = `${BE_URL}/segment/${segmentId}/route`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: selectedTransport,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }
    await res.json(); // discard payload

    // — New: trigger the segment WFS source to reload —
    segmentLayerRef.current.getSource().refresh();

    // (Optionally show a small toast here instead of alert)
  } catch (err) {
    console.error("Fehler beim Optimieren:", err);
    alert(`Fehler beim Optimieren der Route:\n${err.message}`);
  } finally {
    setPopupMode("");
  }
};
