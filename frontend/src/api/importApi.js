const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractUsernameFromUserObject(user) {
  if (!user || typeof user !== "object") return null;

  if (user.username) return user.username;
  if (user.user?.username) return user.user.username;
  if (user.currentUser?.username) return user.currentUser.username;
  if (user.authUser?.username) return user.authUser.username;

  const role = user.role || user.user?.role || user.currentUser?.role;
  const name = user.name || user.user?.name || user.currentUser?.name || "";

  if (role === "operations" || name.toLowerCase().includes("school operations")) {
    return "ops";
  }

  if (role === "hos" || name.toLowerCase().includes("head of school")) {
    return "hos";
  }

  if (role === "hod") {
    const department =
      user.department ||
      user.user?.department ||
      user.currentUser?.department ||
      "";

    if (department === "CSSE") return "hod.csse";
    if (department === "Mathematics") return "hod.maths";
    if (department === "Physics") return "hod.physics";
  }

  return null;
}

function getCurrentUsername() {
  const possibleKeys = [
    "wvs_current_user",
    "user",
    "currentUser",
    "authUser",
    "loggedInUser",
    "workloadUser",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    const parsed = safeParse(value);
    const username = extractUsernameFromUserObject(parsed);

    if (username) return username;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    const parsed = safeParse(value);
    const username = extractUsernameFromUserObject(parsed);

    if (username) return username;
  }

  return null;
}

function getAuthHeaders() {
  const username = getCurrentUsername();

  if (!username) {
    throw new Error(
      "No logged-in user found. Please log out and log in again as School Operations."
    );
  }

  return {
    "x-user": username,
  };
}

function buildYearQuery(workloadYear) {
  if (!workloadYear) return "";

  return `?workloadYear=${encodeURIComponent(workloadYear)}`;
}

export async function uploadExcelFile(file, workloadYear) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workloadYear", String(workloadYear));

  const response = await fetch(`${API_URL}/api/import/excel`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Excel import failed.");
  }

  return data;
}

export async function getImportReport(workloadYear = null) {
  const query = buildYearQuery(workloadYear);

  const response = await fetch(`${API_URL}/api/import/report${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load import report.");
  }

  return data;
}

export async function getImportBatches(workloadYear = null) {
  const query = buildYearQuery(workloadYear);

  const response = await fetch(`${API_URL}/api/import/batches${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load import batches.");
  }

  return data;
}