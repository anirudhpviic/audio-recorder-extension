document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const dataString = urlParams.get("data");

  const data = JSON.parse(decodeURIComponent(dataString));

  await chrome.storage.local.set({ user: data.user });
  await chrome.storage.local.set({ accessToken: data.accessToken });
  await chrome.storage.local.set({ refreshToken: data.refreshToken });

  chrome.runtime.sendMessage({ type: "LOGIN_SUCCESS" });

  setTimeout(() => window.close(), 200);
});
