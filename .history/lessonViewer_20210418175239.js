var units = [];
var lessons = {};

// gets all units
fetch("https://cdn.i-ready.com/instruction/phoenix/master/121/lessonmap.json")
	.then(response => response.json())

	// loads units
	.then(unitData => units = unitData)
	.then(function() {

		// loads lessons from units
		lessonSelect.innerHTML = "";

		listLessons();

		// loops through every lesson in unit
		function listLessons(i = 0, j = 0) {
			fetch(`https://cdn.i-ready.com/instruction/phoenix-content/${Object.keys(units)[i].includes("ELA") ? "reading" : "math"}/${Object.keys(units[Object.keys(units)[i]])[j]}/lessonStructure.json`)
				.then(response => response.json())
				.then(function(lessonData) {

					// adds lessons to lesson select
					var lessonOption = document.createElement("option");
					lessonOption.innerText = lessonData.lessonStructureObj.title;
					lessonOption.value = Object.keys(units[Object.keys(units)[i]])[j];
					lessonSelect.appendChild(lessonOption);

					// puts lesson data in lessons object
					lessons[Object.keys(units[Object.keys(units)[i]])[j]] = lessonData;
					lessons[Object.keys(units[Object.keys(units)[i]])[j]].unit = Object.keys(units)[i];

					// gets lesson definitions
					lessons[Object.keys(units[Object.keys(units)[i]])[j]].definitions = [];

					// gets slide data
					lessons[Object.keys(units[Object.keys(units)[i]])[j]].slides = [];

					for(var k = 0; k < lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData.length; k++){
						var slide = {type: "unknown", name: lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].name};

						// video slide
						if(!!lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].src){
							var src = lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].src;
							slide.type = "video";
							slide.src = `https://cdn.i-ready.com/instruction/phoenix-content/${Object.keys(units)[i].includes("ELA") ? "reading" : "math"}/${Object.keys(units[Object.keys(units)[i]])[j]}/${lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].name}/video/${src}`;
						} else if(!!lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].timelineAudio) {
							var src = lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].timelineAudio;
							slide.type = "audio";
							slide.src = `https://cdn.i-ready.com/instruction/phoenix-content/${Object.keys(units)[i].includes("ELA") ? "reading" : "math"}/${Object.keys(units[Object.keys(units)[i]])[j]}/${lessons[Object.keys(units[Object.keys(units)[i]])[j]].lessonStructureObj.slideData[k].name}/audio/${src}`;
						}

						lessons[Object.keys(units[Object.keys(units)[i]])[j]].slides.push(slide);
					}

					if(i == 0 && j == 0) lessonSelect.onchange()

					// continues loop if applicable (for loop can not be used because of fetch requests)
					if (j < Object.keys(units[Object.keys(units)[i]]).length - 1) {

						// increases j
						listLessons(i, j + 1)
					} else if (i < Object.keys(units).length - 1) {

						// increases i
						listLessons(i + 1);
					} else {

						// done loading
						console.log("done loading.");
					}
				});
		}
	});

	lessonSelect.onchange = function(){
		// adds basic info
		data.innerHTML = `
		<b>Title:</b> ${lessons[lessonSelect.value].lessonStructureObj.title}<br>
		<b>Level:</b> ${lessons[lessonSelect.value].lessonStructureObj.title.split(" - Level ")[1]}<br>
		<b>Subject:</b> ${lessonSelect.value.includes("ELA") ? "Reading" : "Math"}<br>
		<b>Lesson ID:</b> ${lessonSelect.value}<br>
		<b>Link to lesson:</b> <a href="https://cdn.i-ready.com/instruction/phoenix/master/135/?csid=DI.MATH.GEO.8.1005.phx.10_71da0b35-cb71-4540-9e75-73203c6686dc_M_math&type=QUIZ#/lesson/${lessonSelect.value.includes("ELA") ? "reading" : "math"}/${lessonSelect.value}">https://cdn.i-ready.com/instruction/phoenix/master/135/?csid=DI.MATH.GEO.8.1005.phx.10_71da0b35-cb71-4540-9e75-73203c6686dc_M_math&type=QUIZ#/lesson/${lessonSelect.value.includes("ELA") ? "reading" : "math"}/${lessonSelect.value}</a><br>
		<b>Large Thumbnail (not all lessons have one):</b> <br> <img width="250" src="https://cdn.i-ready.com/instruction/content/dashboard/images/lessonthumbnails/${lessons[lessonSelect.value].unit.toLowerCase().split("_").join(".")}.phx_large.jpg"></img><br><br>
		<b>Small Thumbnail (not all lessons have one):</b> <br> <img  width="250" src="https://cdn.i-ready.com/instruction/content/dashboard/images/lessonthumbnails/${lessons[lessonSelect.value].unit.toLowerCase().split("_").join(".")}.phx_small.jpg"></img><br><br>
		<b>Lesson Structure File:</b> <a href="https://cdn.i-ready.com/instruction/phoenix-content/${lessonSelect.value.includes("ELA") ? "reading" : "math"}/${lessonSelect.value}/lessonStructure.json">https://cdn.i-ready.com/instruction/phoenix-content/${lessonSelect.value.includes("ELA") ? "reading" : "math"}/${lessonSelect.value}/lessonStructure.json</a><br>
		<b>Slide Count:</b> ${lessons[lessonSelect.value].lessonStructureObj.slideData.length} <br>
		<b>Slide Files:</b><br>`

		// adds slide files
		for(var i = 0; i < lessons[lessonSelect.value].slides.length; i++){
			var slide = lessons[lessonSelect.value].slides[i];
			if(slide.type != "unknown") data.innerHTML += `<br><i>"${slide.src.split("/")[slide.src.split("/").length - 1]}"</i> <br> <video controls width="250" src="${slide.src}"></video> <br>`
		}
	}