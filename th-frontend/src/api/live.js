export async function getLive(room, ip) {
  const url = `http://${ip}:8000/full_report`;
  console.log(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Pi unreachable");
  return res.json();
}