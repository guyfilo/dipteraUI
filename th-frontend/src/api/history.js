const NAS = "http://100.76.177.32:8888";

export async function getAvailableDates(room) {
  const res = await fetch(`${NAS}/history/dates/${room}`);
  return res.json();
}

export async function getDay(room, date) {
  const res = await fetch(`${NAS}/history/${room}/${date}`);
  return res.json();
}

export async function getHourly(room, date) {
  const res = await fetch(`${NAS}/history/hourly/${room}/${date}`);
  return res.json();
}