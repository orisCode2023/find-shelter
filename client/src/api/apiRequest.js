const BASE_URL = "http://localhost:5000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Error in the api request`);
  }
  return res.json();
}


export async function fetchAllShelters() {
  return request("/shelters");
}


// export async function fetchShelterById(id) {
//   return request(`/shelters/${id}`);
// }

// export async function createShelter(data) {
//   return request("/shelters", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// export async function updateShelter(id, data) {
//   return request(`/shelters/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//   });
// }

// export async function patchShelter(id, patch) {
//   return request(`/shelters/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(patch),
//   });
// }


// export async function deleteShelter(id) {
//   return request(`/shelters/${id}`, { method: "DELETE" });
// }
