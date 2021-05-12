// gets lesson data
var csid = html5Iframe.src.split("?csid=")[1].split("&type")[0];
var score = csid.includes("10_") ? null : "{\"score\":100}"; // you can replace the "100" with any score you want if this is pasted on a quiz.

// tricks server into thinking specific lesson was completed
fetch("https://login.i-ready.com/student/lesson/componentCompleted", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json;charset=UTF-8",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1"
  },
  "referrer": "https://login.i-ready.com/student/dashboard/home",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": `{\"componentStatusId\":\"${csid}\",\"instructionLessonOutcome\":${score}}`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
