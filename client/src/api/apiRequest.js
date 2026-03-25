const BASE_URL = "http://localhost:3000";

export async function requestPost(path, bodyData) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
   body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    throw new Error(`Error in the api request`);
  }
  return res.json();
}


