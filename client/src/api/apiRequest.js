const BASE_URL = "http://localhost:5000";

async function request(path) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
    },
    cache: 'no-cache'
  });

  if (!res.ok) {
    throw new Error(`Error in the api request`);
  }
  return res.json();
}
export async function fetchAllShelters() {
  return await request("/shelters");
}

