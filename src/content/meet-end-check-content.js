window.addEventListener("beforeunload", async () => {
  chrome.runtime.sendMessage({ type: "USER_LEFT_MEET" });
});

window.addEventListener("offline", async () => {
  chrome.runtime.sendMessage({ type: "USER_LEFT_MEET" });
});

// window.addEventListener("close", async () => {
//   chrome.runtime.sendMessage({ type: "USER_LEFT_MEET" });
// });
