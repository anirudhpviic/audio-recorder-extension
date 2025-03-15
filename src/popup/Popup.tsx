// const Popup = () => {
//   const handleClick = async () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
//     });
//   };

import { useEffect, useState } from "react";

//   return (
//     <div
//       style={{
//         width: "300px",
//         display: "flex",
//         flexDirection: "column",
//         gap: "10px",
//       }}
//     >
//       Popup
//       <button
//         style={{ padding: "10px", backgroundColor: "green" }}
//         onClick={handleClick}
//       >
//         click
//       </button>
//     </div>
//   );
// };

// export default Popup;

const Popup = () => {
  const [user, setUser] = useState<any>({});
  const handleLogin = () => {
    const width = 500;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 4;
    window.open(
      "http://localhost:3000/auth",
      "Google Login",
      `width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  useEffect(() => {
    // Listen for messages from success.html
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === "LOGIN_SUCCESS") {
        chrome.storage.local.get(["user"], (result) => {
          if (result.user) {
            setUser(result.user);
            console.log("User:", result.user);
          } else {
            console.log("No user found in storage.");
          }
        });
      }
    });
  }, []);

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
      }}
    >
      {!user.email ? (
        <>
          <h3>Chrome Extension Login</h3>
          <button onClick={handleLogin}>Login with Google</button>
        </>
      ) : (
        <>
          <h3>firstName: {user.firstName}</h3>
          <h3>email: {user.email}</h3>
        </>
      )}
    </div>
  );
};

export default Popup;
