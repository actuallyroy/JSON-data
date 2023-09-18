var points = [];
    var currentPoint = [];
    var markers = [];
    var currentMarker;
    var currentMarkerImage;
    var currentMarkerEmoji;
    var markerSize = 30;
    var isPhone = false;
    var dataChanged = false;
    var frameColor = "Dark Brown";
    var frameSize = "8x8";
    var lockMapMove = true;

    const markerToTextSize = {
        20: 12,
        30: 15,
        40: 18,
    };


    const frameURLs = {
        "Dark Brown": "https://static.wixstatic.com/media/9fba21_24db682ca706494b8072a122e128fc89~mv2.png",
        Natural: "https://static.wixstatic.com/media/9fba21_6cd730decf5c49fab0b42cc9ebef495c~mv2.png",
    };

    preloadImage(Object.values(frameURLs));

    const defaultMapStyle = {
        labelled: "mapbox://styles/pinenlime/ckknu6rsw62dq17nubbhdk7zg",
        unlabelled: "mapbox://styles/pinenlime/ckqzddkfy3p9l18p7toi6zq4r",
    };

    const labelInput = document.getElementById("title");
    const warnMessage = document.getElementById("warn-message");
    const warnPopup = document.querySelector(".warn-popup");
    // const emojiPicker = document.querySelector("emoji-picker");
    const mapLabelSwitch = document.getElementById("mapLabelSwitch");
    const doneBtn = document.getElementById("doneBtn");
    const nextBtn = document.getElementById("nextBtn");
    const okBtn = document.getElementById("okBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const mapGenerator = document.getElementById("mapGenerator");
    const mapContainer = document.querySelector(".map-container");
    const titleInput = document.getElementById("titleInput");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const frameColorSelector = document.getElementById("frameColorSelector");
    const previewImg = document.getElementById("preview-img");
    const frameImg = document.getElementById("frame-img");
    const lockBtn = document.getElementById("lock-btn");
    const emojiPicker = document.querySelector("emoji-picker")
    
    frameImg.src = frameURLs["Dark Brown"];

    const accessToken = "pk.eyJ1IjoicGluZW5saW1lIiwiYSI6ImNrN3N6eTQ0bzByNmgzbXBsdmlwY25reDIifQ.QZROImVZfGk44ZIJLlYXQg";

    let emojiNumberMap = {};
    fetch("emojiToNumMap.json")
        .then((response) => response.json())
        .then((data) => {
            emojiNumberMap = data;
            emojiNumberMap = {
                "🎓": 1156,
            };
        });

    var mapData = {
        mapStyle: defaultMapStyle.labelled,
        mapZoom: 15,
        mapCenter: [55.14, 25.069],
        markers: [],
    };

    var productData = {};

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
        container: "map",
        style: mapData.mapStyle,
        center: mapData.mapCenter,
        zoom: mapData.mapZoom,
        attributionControl: false,
        crossSourceCollisions: false,
        pitchWithRotate: false,
        touchPitch: false,
    });

    map.scrollZoom.disable();
    map.dragPan.disable();
    map.doubleClickZoom.disable();

    map.addControl(
        new mapboxgl.NavigationControl({
            visualizePitch: false,
        })
    );

    let tempMarker = new mapboxgl.Marker(document.createElement("div")).setLngLat(map.getCenter());

    map.on("load", () => {
        let tempWidth = getComputedStyle(document.body).width;
        tempWidth = parseInt(tempWidth.substring(0, tempWidth.length - 2));
        if (tempWidth < 600) {
            isPhone = true;
        }
    });

    // If mapData exists in local storage then loadState
    if (sessionStorage.getItem("mapData")) {
        mapData = JSON.parse(sessionStorage.getItem("mapData"));
        setTimeout(() => {
            loadState(mapData);
            lockMapMove = false;
        }, 500);
    } else {
        lockMapMove = false;
    }

    // {
    //   Title: "ForgetMeNot",
    //   ID: "0107bc23-214e-4e63-a6ac-ce12ff111111",
    //   Owner: "c2915199-3d7d-45ac-9719-c8ed474da701",
    //   Created Date: "2021-05-15T18:55:34Z",
    //   Updated Date: "2021-05-15T18:55:34Z",
    //   image: "https://static.wixstatic.com/media/c935e2_1c5e0ae6971441509ac0a3ae1f3f6dec~mv2.png",
    //   styleId: "mapbox://styles/pinenlime/cl0v5yn5x009k14mdgtxynxpq",
    //   styleIdLabelled: "mapbox://styles/pinenlime/ckxj442gwk1a415o5qlzx6jhw",
    //   coMap: [ ],
    //   MapGalleryData-1: [ ],
    //   border: "black",
    //   borderDouble: "",
    //   doubleMap: true
    // }

    fetch("https://d1wxxs914x4wga.cloudfront.net/MapDesigns/design.json")
        .then((response) => response.json())
        .then((mapStyles) => {
            let mapStyleCont = document.getElementById("map-style-cont");
            mapStyles.forEach((mapStyle) => {
                let mapStyleElem = document.createElement("div");
                mapStyleElem.classList.add("map-style");
                mapStyleElem.title = mapStyle.Title;
                if (mapStyle.styleId == defaultMapStyle.unlabelled) mapStyleElem.classList.add("active-style");
                mapStyleElem.setAttribute("styleID", mapStyle.styleId);
                mapStyleElem.setAttribute("styleIDlabelled", mapStyle.styleIdLabelled);
                mapStyleElem.innerHTML = `<img src="${mapStyle.image}" alt="" srcset="">`;
                mapStyleElem.onclick = () => {
                    let activeStyle = document.querySelector(".active-style");
                    if (activeStyle) activeStyle.classList.remove("active-style");
                    mapStyleElem.classList.add("active-style");
                    var style = mapStyle.styleId;
                    if (mapLabelSwitch.checked) style = mapStyle.styleIdLabelled;
                    map.setStyle(style);
                    mapData.mapStyle = style;
                    dataChanged = true;
                    console.log("here");
                    sessionStorage.setItem("mapData", JSON.stringify(mapData));
                };
                mapStyleCont.appendChild(mapStyleElem);
            });
        });

    mapLabelSwitch.onclick = () => {
        const activeStyle = document.querySelector(".active-style");

        let style;
        if (activeStyle) {
            if (mapLabelSwitch.checked) {
                style = activeStyle.getAttribute("styleIDlabelled");
            } else {
                style = activeStyle.getAttribute("styleID");
            }
        } else {
            if (mapLabelSwitch.checked) style = defaultMapStyle.labelled;
            else style = defaultMapStyle.unlabelled;
        }
        map.setStyle(style);
        mapData.mapStyle = style;
        dataChanged = true;
        console.log("here");
        sessionStorage.setItem("mapData", JSON.stringify(mapData));
    };

    let cStyle = document.createElement("style");
    cStyle.innerHTML = `
      .active-emo{
        background-color: #d9d9d9;
      }
      .favorites{
        display: none;
      }
      .body{
        transition: all 0.1s ease-in-out;
      }`;
    let interval = setInterval(() => {
        if (emojiPicker.shadowRoot) {
            clearInterval(interval);
            emojiPicker.shadowRoot.appendChild(cStyle);
        }
    }, 100);

    document.getElementById("emoji-size-cont").onclick = (e) => {
        let t = e.target.value;

        if (t) markerSize = t;
        try {
            tempMarker.getElement().querySelector(".marker").style.height = markerSize + "px";
        } catch (error) {}
        cursorImage = emojiToImg(currentMarkerEmoji, markerSize);
        document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = `url(${cursorImage}) ${(markerSize * 12) / 16} ${(markerSize * 9) / 16 + (markerToTextSize[markerSize] + 3) / 2}, grab`;
    };

    emojiPicker.addEventListener("emoji-click", (event) => {
        let activeEmojiElem = emojiPicker.shadowRoot.querySelectorAll(".active-emo");
        if (activeEmojiElem[1]) activeEmojiElem[1].classList.remove("active-emo");
        if (activeEmojiElem[0]) activeEmojiElem[0].classList.remove("active-emo");
        let clickedEmoji1 = emojiPicker.shadowRoot.getElementById("emo-" + event.detail.emoji.unicode);
        let clickedEmoji2 = emojiPicker.shadowRoot.getElementById("fav-" + event.detail.emoji.unicode);
        if (clickedEmoji1) clickedEmoji1.classList.add("active-emo");
        if (clickedEmoji2) clickedEmoji2.classList.add("active-emo");
        currentMarkerImage = emojiToImg(event.detail.unicode, 85);
        currentMarkerEmoji = event.detail.unicode;
        cursorImage = emojiToImg(event.detail.unicode, markerSize);
        unlockMap();
        document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = `url(${cursorImage}) ${(markerSize * 12) / 16} ${(markerSize * 9) / 16 + (markerToTextSize[markerSize] + 3) / 2}, grab`;
        if (isPhone) {
            let divElem = document.createElement("div");
            divElem.style.display = "flex";
            divElem.style.flexDirection = "column";
            divElem.style.alignItems = "center";
            var el = new Image();
            el.height = markerSize;
            el.className = "marker";
            el.src = currentMarkerImage;
            let label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = ".";
            label.style.fontSize = markerToTextSize[markerSize];
            divElem.appendChild(el);
            divElem.appendChild(label);
            tempMarker.getElement().innerHTML = "";
            tempMarker.getElement().appendChild(divElem);
            tempMarker.addTo(map);

            document.querySelector(".ok-cancel").style.display = "flex";
        }
    });

    cancelBtn.onclick = () => {
        tempMarker.remove();
        document.querySelector(".ok-cancel").style.display = "none";
        document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = "grab";
        lockMap();
    };

    okBtn.onclick = () => {
        let marker = new mapboxgl.Marker(tempMarker.getElement().querySelector("div"), {
                draggable: true,
            })
            .setLngLat(map.getCenter())
            .addTo(map);

        marker.index = markers.length;
        currentPoint = map.getCenter();
        currentMarker = marker;

        // Attach click event listener to remove the marker when clicked
        marker.getElement().addEventListener("click", () => {
            points.splice(marker.index, 1);
            markers.splice(marker.index, 1);
            marker.remove();
            dataChanged = true;
            console.log("here");
            sessionStorage.setItem("mapData", JSON.stringify(mapData));
        });

        labelInput.style.display = "block";
        labelInput.value = "";
        labelInput.focus();
        document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = "grab";
        document.querySelector(".ok-cancel").style.display = "none";
        dataChanged = true;
        console.log("here");
        sessionStorage.setItem("mapData", JSON.stringify(mapData));
    };

    map.on("click", (e) => {
        if (currentMarkerImage && !isPhone) {
            const lonLat = Object.values(e.lngLat);
            currentPoint = lonLat;
            points.push(currentPoint);
            let divElem = document.createElement("div");
            divElem.style.display = "flex";
            divElem.style.flexDirection = "column";
            divElem.style.alignItems = "center";
            var el = new Image();
            el.height = markerSize;
            el.className = "marker";
            el.src = currentMarkerImage;
            let label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = ".";
            label.style.fontSize = markerToTextSize[markerSize];
            divElem.appendChild(el);
            divElem.appendChild(label);

            let marker = new mapboxgl.Marker(divElem, {
                    draggable: true,
                })
                .setLngLat(currentPoint)
                .addTo(map);

            marker.index = markers.length;

            currentMarker = marker;

            // Attach click event listener to remove the marker when clicked
            marker.getElement().addEventListener("click", () => {
                points.splice(marker.index, 1);
                markers.splice(marker.index, 1);
                marker.remove();
                dataChanged = true;
                console.log("here");
                sessionStorage.setItem("mapData", JSON.stringify(mapData));
            });
            document.body.style.cursor = "auto";
            document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = "auto";
            dataChanged = true;
            console.log("here");
            sessionStorage.setItem("mapData", JSON.stringify(mapData));
        }
    });

    map.on("move", (e) => {
        tempMarker.setLngLat(map.getCenter());
    })

    map.on("moveend", (e) => {

        if (points) {
            let isOutOfBounds = false;

            points.forEach((point) => {
                let temp = map.project(point);
                if (temp.x <= 10 || temp.x >= 490 || temp.y <= 10 || temp.y >= 490) {
                    isOutOfBounds = true;
                }
            });

            if (isOutOfBounds) {
                // map.stop(); // Stop any ongoing map movements
                // map.setCenter(tempCenter);
                warnPopup.style.display = "block";
                warnMessage.innerHTML = "😧Oh no!! some of your markers are going out of the visible area!!";
            } else {
                warnPopup.style.visibility = "visible";
                warnPopup.style.display = "none";
            }
        }
        if (!lockMapMove) mapData.mapCenter = Object.values(map.getCenter());
        dataChanged = true;
        console.log("here", mapData);
        sessionStorage.setItem("mapData", JSON.stringify(mapData));
    });

    // doneBtn.onclick = () => {
    //   document.querySelector(".window-1").style.display = "none";
    //   // for (var i = 0; i < markers.length; i++) {
    //   //   markers[i].markerCoordinates = Object.values(map.project(markers[i].markerLocation));
    //   // }
    //   // mapData.markers = markers;
    //   //
    // };

    frameColorSelector.onclick = (e) => {
        let t = e.target.value;
        if (t) {
            frameImg.src = frameURLs[t];
            frameColor = t;
        }
    };

    titleInput.onchange = () => {
        if (!lockMapMove) {
            mapData.message = titleInput.value;
        }
        dataChanged = true;
        console.log("here");
        sessionStorage.setItem("mapData", JSON.stringify(mapData));
    };

    nextBtn.onclick = () => {
        window.parent.postMessage("done", "https://www.pinenlime.com");
        window.parent.postMessage("done", "https://editor.wix.com");
        if (nextBtn.textContent == "Next") {
            document.querySelector(".window-1").style.display = "none";
            document.querySelector(".window-2").style.display = "block";
            nextBtn.innerHTML = `<i class="bi bi-arrow-left-short"></i>Previous`;
            document.querySelector(".window-2").scrollIntoView();
            nextBtn.style.padding = "5px 45px 5px 5px";

            if (dataChanged) {
                previewImg.src = "https://static.wixstatic.com/media/ebc535_fb796e534a184261975839ce31009a20~mv2.gif";
                for (var i = 0; i < markers.length; i++) {
                    markers[i].markerCoordinates = Object.values(map.project(markers[i].markerLocation));
                }
                mapData.markers = markers;
                mapData.message = titleInput.value;
                mapContainer.style.display = "block";

                mapContainer.innerHTML = generateMapsHTML(mapData);
                html2canvas(mapContainer, {
                    dpi: "200",
                    useCORS: true,
                    onrendered: function (canvas) {
                        var canvasImg = canvas.toDataURL("image/jpg");
                        previewImg.src = canvasImg;
                        mapContainer.style.display = "none";
                        dataChanged = false;
                        addToCartBtn.style.display = "flex";
                    },
                });
            }
        } else {
            document.querySelector(".window-1").style.display = "block";
            document.querySelector(".window-2").style.display = "none";
            nextBtn.innerHTML = `Next<i class="bi bi-arrow-right-short">`;
            nextBtn.style.padding = "5px 5px 5px 50px";
            if (isPhone) {}
        }
    };

    addToCartBtn.onclick = () => {
        console.log("add to cart");
        productData = {
            quantity: 1,
            frameSize: "8x8",
            map_type: "journeymap",
            product_id: "Journey Map",
            frameColor: frameColor,
            product: "JOURNEY_MAP",
            mapData: mapData,
        };

        window.parent.postMessage(productData, "https://www.pinenlime.com");
        window.parent.postMessage(productData, "https://editor.wix.com");
    };

    lockBtn.onclick = () => {
        if (lockBtn.classList.contains("bi-lock-fill")) {
            unlockMap();
        } else {
            lockMap();
        }
    };

    function unlockMap() {
        lockBtn.classList.remove("bi-lock-fill");
        lockBtn.classList.add("bi-unlock-fill");
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.touchZoomRotate.enable();
    }

    function lockMap() {
        lockBtn.classList.remove("bi-unlock-fill");
        lockBtn.classList.add("bi-lock-fill");
        map.scrollZoom.disable();
        map.dragPan.disable();
        map.touchZoomRotate.disable();
    }

    function fitMap() {
        let distances = calculateManhattanDistances(points);
        let bound = distances[Math.max(Object.keys(distances))];

        map.fitBounds(Object.values(bound));
    }

    function calculateManhattanDistances(points) {
        // Function to calculate the Manhattan distance between two points
        function manhattanDistance(point1, point2) {
            let distance = 0;
            for (let i = 0; i < point1.length; i++) {
                distance += Math.abs(point1[i] - point2[i]);
            }
            return distance;
        }

        const numPoints = points.length;
        const distances = {};

        for (let i = 0; i < numPoints; i++) {
            for (let j = i + 1; j < numPoints; j++) {
                const distance = manhattanDistance(points[i], points[j]);
                distances[distance] = {
                    point1: points[i],
                    point2: points[j],
                };
            }
        }
        return distances;
    }

    map.on("zoom", (e) => {
        if (points.length) {
            // Convert lat-lon points to pixel points
            const pixelPoints = points.map((point) => [map.project(point).x, map.project(point).y]);

            // Calculate Manhattan distances and check if any are less than 55 pixels
            const distances = Object.keys(calculateManhattanDistances(pixelPoints));

            let isTooClose = Math.min(...distances) < 50;
            let outOfBounds = false;
            pixelPoints.forEach((point) => {
                if (point[0] <= 0 || point[0] >= 500 || point[1] <= 0 || point[1] >= 500) {
                    outOfBounds = true;
                }
            });

            // If points are too close, adjust the zoom level
            if (isTooClose) {
                // e.preventDefault();
                // map.stop()
                // map.setZoom(map.getZoom() + 0.01);
                warnPopup.style.display = "block";
                warnMessage.innerHTML = "😧Oh no!! some of your markers may be overlapping";
            } else if (outOfBounds) {
                warnPopup.style.display = "block";
                warnMessage.innerHTML = "😧Oh no!! some of your markers are going out of the visible area!!";
            } else {
                warnPopup.style.visibility = "visible";
                warnPopup.style.display = "none";
            }
        }
        if (dataChanged) {
            mapData.mapCenter = Object.values(map.getCenter());
            mapData.mapZoom = map.getZoom();
            dataChanged = true;
        }
    });

    window.onclick = (e) => {
        if ((e.target.className == "mapboxgl-canvas" || e.target.id == "okBtn") && currentMarkerImage && !isPhone) {
            labelInput.style.display = "block";
            labelInput.value = "";
            labelInput.focus();
            e.target.scrollIntoView();
            let temp = window.getComputedStyle(title).width;
            labelInput.style.left = e.pageX - parseFloat(temp.substr(0, temp.length - 2)) / 2;
            labelInput.style.top = e.pageY;
            document.querySelector(".mapboxgl-canvas-container.mapboxgl-interactive").style.cursor = "grab";
        }
    };

    window.onmessage = (event) => {
        if (event.data) {
            //    set map center to event.data.latlong
            map.setCenter(event.data.latlong);
        }
    };

    labelInput.onkeypress = (e) => {
        if (event.key === "Enter") {
            labelInput.style.display = "none";
        }
    };

    labelInput.onblur = () => {
        if (currentMarker) {
            currentMarker.getElement().querySelector(".label").innerHTML = labelInput.value;
            markers.push({
                markerEmoji: currentMarkerEmoji,
                markerLabel: labelInput.value,
                markerLocation: currentPoint,
                markerSize: markerSize,
            });
            currentMarkerImage = null;
            currentMarkerEmoji = null;
            currentMarker = null;
        }
        labelInput.style.display = "none";
        let activeEmojiElem = emojiPicker.shadowRoot.querySelectorAll(".active-emo");
        if (activeEmojiElem[1]) activeEmojiElem[1].classList.remove("active-emo");
        if (activeEmojiElem[0]) activeEmojiElem[0].classList.remove("active-emo");
        lockMap();
        dataChanged = true;
        console.log("here");
        sessionStorage.setItem("mapData", JSON.stringify(mapData));
    };

    // Utils
    function emojiToImg(emojiTxt, size) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.height = (size * 9) / 8;
        canvas.width = (size * 12) / 8;

        ctx.font = `${size}px "Noto Color Emoji"`;
        ctx.fillText(emojiTxt, size / 8, (size * 4.5) / 5);

        return canvas.toDataURL();
    }

    function generateMapsHTML(mapData) {
        const markerToTextSize = {
            20: 25,
            30: 30,
            40: 35,
        };
        let markersHTML = "";
        let mapUrl = `https://api.mapbox.com/styles/v1/pinenlime/${mapData.mapStyle.replace("mapbox://styles/pinenlime/", "")}/static/${mapData.mapCenter[0]},${mapData.mapCenter[1]},${mapData.mapZoom},0/500x500@2x?access_token=pk.eyJ1IjoicGluZW5saW1lIiwiYSI6ImNrN3N6eTQ0bzByNmgzbXBsdmlwY25reDIifQ.QZROImVZfGk44ZIJLlYXQg&logo=false&attribution=false`;

        mapData.markers.forEach((marker) => {
            markersHTML += `<div class="marker-cont" style="left: ${marker.markerCoordinates[0] - 15}px; top: ${marker.markerCoordinates[1] - 14.5}px">
<img class="marker" height="${marker.markerSize}" src="${emojiToImg(marker.markerEmoji, 85)}" />
<div class="label-1"><img height="${markerToTextSize[marker.markerSize]}" src=${textToImage(marker.markerLabel, "100px", "Homemade Apple")}></div>
</div>`;
        });

        return `<img height="500" width="500" src="${mapUrl}" alt="" id="mapImage" />
${
  mapData.message
    ? `<div class="message-box-cont">
<div id="message-box" class="message-box">${mapData.message}</div>
</div>`
    : ""
}${markersHTML}`;
    }

    function textToImage(text, fontSize = "20px", fontFace = "Arial") {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = "bold " + fontSize + " " + fontFace;

        var metrics = context.measureText(text);
        var textWidth = metrics.width;
        var textHeight = parseInt(fontSize, 10);

        canvas.width = textWidth + textHeight / 1.5; // Adding some padding
        canvas.height = textHeight * 2; // Adding some padding
        context.font = "bold " + fontSize + " " + fontFace;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "black";

        context.strokeStyle = "white"; // Outline color
        context.lineWidth = 15; // Outline width

        var textX = (canvas.width - textWidth + textHeight / 4) / 2;
        var textY = (canvas.height + textHeight) / 2.5; // Aligning roughly at the vertical center

        context.strokeText(text, textX, textY);

        context.fillText(text, textX, textY);
        var imageUrl = canvas.toDataURL("image/png");
        return imageUrl;
    }

    frameColorSelector;

    function getImageFromEmoji(emojiChar) {
        Object.keys(emojiNumberMap).forEach((emoji) => {
            if (emoji == emojiChar) {
                return `https://d1wxxs914x4wga.cloudfront.net/emoji/emoji-${emojiNumberMap[emoji]}.png`;
            }
        });
    }

    function preloadImage(url) {
        var img = new Image();
        img.src = url;
    }

    function loadState(mapData) {
        mapData.markers.forEach((marker) => {
            let divElem = document.createElement("div");
            divElem.style.display = "flex";
            divElem.style.flexDirection = "column";
            divElem.style.alignItems = "center";
            var el = new Image();
            el.height = marker.markerSize;
            el.className = "marker";
            el.src = emojiToImg(marker.markerEmoji, 85);
            let label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = marker.markerLabel;
            label.style.fontSize = markerToTextSize[marker.markerSize];
            divElem.appendChild(el);
            divElem.appendChild(label);

            let markerObj = new mapboxgl.Marker(divElem, {
                    draggable: true,
                })
                .setLngLat(marker.markerLocation)
                .addTo(map);

            markerObj.index = markers.length;

            points.push(marker.markerLocation);

            // Attach click event listener to remove the marker when clicked
            markerObj.getElement().addEventListener("click", () => {
                points.splice(markerObj.index, 1);
                markers.splice(markerObj.index, 1);
                markerObj.remove();
            });
        });
        markers = mapData.markers;
        titleInput.value = mapData.message || ""
        dataChanged = true;
        map.setCenter(mapData.mapCenter);
        map.setStyle(mapData.mapStyle);
        map.setZoom(mapData.mapZoom);

        let activeStyleElem = document.querySelector(`[styleidlabelled="${mapData.mapStyle}"]`) || document.querySelector(`[styleid="${mapData.mapStyle}"]`);
        document.querySelector(".active-style").classList.remove("active-style");
        activeStyleElem.classList.add("active-style");
    }
