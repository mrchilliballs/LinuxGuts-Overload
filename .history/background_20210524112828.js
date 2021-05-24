document.addEventListener("keydown", (e)=>{
    console.log(e.key)
})
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        localStorage.setItem("clientId", Math.floor(Math.random() * 10000));
    } else if(details.reason == "update") {
        // perform some logic
    }
});