const Home = () => {
  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
    });
  };

  return (
    <div
      style={{
        width: "500px",
        height: "600px",
      }}
    >
      <button
        style={{ padding: "10px", backgroundColor: "green" }}
        onClick={handleClick}
      >
        click
      </button>
    </div>
  );
};

export default Home;
