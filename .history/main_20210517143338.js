// gets lesson viewer url
var lessonViewer = `chrome-extension://${chrome.runtime.id}/lessonViewer.html`;

// creates UI
var UI = document.createElement("div");
UI.classList.add("border-danger");
UI.classList.add("border-")
UI.innerHTML = `
	<div style="width:300px; left: 1px; top: 1px; background-color:white; color:black; outline: white solid 1px; position:absolute; z-index: 99999;">
		<h1 class="m-0 h4">iReady Overload<span class="h6" style="position:absolute; top:0; left:290px;" id="Mini-Button">-</span></h1>
		<br>
		<div id="box">
		<h2 style="font-style: normal !important; color: black !important;" class="h5">Lesson Skipper</h2>
		<button onclick="skipLesson()" class="btn btn-danger btn-sm">Skip current lesson</button>
		<br><br>
		<h2 style="font-style: normal !important; color: black !important;" class="h5">Minutes Hack</h2>
		<button onclick="farmMinutes(this)" class="btn btn-danger btn-sm">Farm minutes</button>
		<br><br>
		<h2 style="font-style: normal !important; color: black !important;">Lesson Viewer</h2>
		This tool searches through all known iReady lessons and their files. Right click and copy this <a href="${lessonViewer}">this</a> and open it in a new tab to access the tool.
		</div>
		<script>
		function minimizeMaximize(){
			document.querySelector("#Mini-Button").addEventListener("click", ()=>{
				document.querySelector("#box").style.display = "none";
			})
		}minimizeMaximize()</script>
	</div>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">`

// injects functions into iready site
var functionsScript = document.createElement("script");
functionsScript.innerHTML = `var minuteFarming = false; ${skipLesson.toString()} \n ${farmMinutes.toString()} \n ${getCookie.toString()} \n`
document.body.appendChild(functionsScript);

// shamelessly stolen from https://www.w3schools.com/howto/howto_js_draggable.asp
//Make the DIV element draggagle:
dragElement(UI.firstElementChild);
document.body.appendChild(UI);

function dragElement(elmnt) {
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (document.getElementById(elmnt.id + "header")) {
		/* if present, the header is where you move the DIV from:*/
		document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		/* otherwise, move the DIV from anywhere inside the DIV:*/
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

function skipLesson() {
	// checks if a lesson/quiz is open
	if (!window["html5Iframe"]) {
		alert("You do not have a lesson currently open. You must open a lesson to skip it.");
	} else {
		// gets lesson data
		var csid = html5Iframe.src.split("?csid=")[1].split("&type")[0];

		var scoreInput = csid.includes("10_") ? null : prompt("Quiz detected. What score would you like (out of 100)?", 100);
		var score = csid.includes("10_") ? null : `{"score":${scoreInput}}`; // you can replace the "100" with any score you want if this is pasted on a quiz.

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

		alert("Close the lesson/quiz and you should see it was skipped.");
	}
}

function farmMinutes(buttonId) {
	// checks if currently farming minutes
	if (minuteFarming) {
		csid = getCookie("csid");

		// sends fetch request to stop timer and update time
		fetch(`https://login.i-ready.com/student/v1/web/lesson_component/${csid}?action=pause`, {
			"headers": {
				"accept": "application/json, text/plain, */*",
				"accept-language": "en-US,en;q=0.9",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin"
			},
			"referrer": "https://login.i-ready.com/student/dashboard/home",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		});

		// resets some variables
		document.cookie = `csid=; expires=Thu, 18 Dec 1970 12:00:00 UTC"`;
		buttonId.innerText = "Farm minutes";
		minuteFarming = false;

		alert("The minutes should now be in your account.");
	}
	// checks if lesson/quiz is open
	if (!!window["html5Iframe"]) {
		// gets lesson data
		var csid = html5Iframe.src.split("?csid=")[1].split("&type")[0];
		var minutes = 45; // change the 45 to the amount of time you want. This is only neccessary for the alternate hack.

		// sets cookies in case something breaks
		document.cookie = `csid=${csid}; expires=Thu, 18 Dec 2999 12:00:00 UTC"`;
		document.cookie = `minutes=${minutes}; expires=Thu, 18 Dec 2999 12:00:00 UTC"`;

		alert("Neccessary data to farm minutes have now been collected. To begin farming minutes, go to the iReady menu by closing this lesson/quiz. Then, press this button again.");
	} else if (!getCookie("csid")) {
		// lesson isn't open and cookie isnt set
		alert("You do not have a lesson currently open. You must open a lesson to begin the proccess.")
	} else {
		// lesson isn't open and cookie is set
		csid = getCookie("csid");

		// sends fetch request to start timer
		fetch(`https://login.i-ready.com/student/v1/web/lesson_component/${csid}?action=resume`, {
			"headers": {
				"accept": "application/json, text/plain, */*",
				"accept-language": "en-US,en;q=0.9",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin"
			},
			"referrer": "https://login.i-ready.com/student/dashboard/home",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		});

		// sets variable to know minutes are being farmed
		minuteFarming = true;
		buttonId.innerText = "Stop farming minutes";

		alert("The minute farming proccess has now begun. Do not close this page. Do not turn off your computer. After you press \"ok,\" every minute that passes will be added to your account. When you want to stop the timer and add the farmed minutes to your account, press the button labeled \"Stop farming minutes\". Press \"ok\" to begin.");
	}
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}