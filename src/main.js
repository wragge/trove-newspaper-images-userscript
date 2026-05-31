/*
This userscript imports Jimp (https://jimp-dev.github.io/jimp/) to handle the image manipulation.
Jimp is copyright 2018 Oliver Moran and made available under an MIT licence (https://github.com/jimp-dev/jimp/blob/main/LICENSE). 
*/

import { Jimp } from 'jimp';

// Extract the page identifier from the first 'zone' div.
function getPageId(zones) {
    if (!zones) {
        zones = document.querySelectorAll("div.zone.onPage.readMode");
    }
    const pageId = zones[0].getAttribute("data-page-id");
    return pageId
}

// Display a thumbnail and link to download the image.
async function displayDownload(imageUrl, imageType, imageId) {
    // Target to add download links
    let downloadPanel = document.querySelector("form.renditions").parentElement;
    
    // Create thumbnail image
    let imageElem = document.createElement("img");
    imageElem.setAttribute("src", imageUrl);
    imageElem.setAttribute("width", 200);
    
    // Create a download link
    let downLink = document.createElement("a");
    downLink.setAttribute("href", imageUrl);
    downLink.setAttribute("download", `nla.news-${imageType}${imageId}.jpg`);
    
    // Enclose thumbnail in link
    let imageLink = downLink.cloneNode();
    imageLink.appendChild(imageElem);
    
    // Enclose thumbnail/link in para and add to panel
    let imagePara = document.createElement("p")
    imagePara.appendChild(imageLink);
    downloadPanel.appendChild(imagePara);

    // Create text link and add to panel
    let textLink = downLink.cloneNode();
    textLink.innerText = "Click to download";
    let textPara = document.createElement("p");
    textPara.appendChild(textLink);
    downloadPanel.appendChild(textPara);
}

// Get a full page image url
async function getPageImage () {
    const pageId = getPageId();
    const pageUrl = `https://trove.nla.gov.au/imageservice/nla.news-page${pageId}/level7`;
    await displayDownload(pageUrl, "page", pageId);
}

// Convert the Jimp image to a data Url
async function prepareArticleImage(image, pageId) {
    // Get the article identifier from the url
    const articleId = document.location.href.match(/article\/(\d+)/)[1];
    
    // Convert the image to buffer
    // I think this might give marginally better performance than converting to base64 directly
    const buffer = await image.getBuffer("image/jpeg", {quality: 90});
    const blob = new Blob([buffer], { type: "image/jpeg" });
    // Create data Url
    const imageUrl = URL.createObjectURL(blob);
    await displayDownload(imageUrl, "article", `${articleId}-page${pageId}`);  
}

// Crop and (optionally) mask article
async function getArticleImage() {
    const scale = parseInt(document.querySelector("#article-scale-select").value) / 10;

    // Add in progress message
    let progressPara = document.querySelector("#image-load-progress");
    progressPara.innerText = "Preparing image...";
    
    // Get the zones with OCR content
    const zones = document.querySelectorAll("div.zone.onPage.readMode");
    
    // Starting points for article bbox
    let left = 10000;
    let right = 0;
    let top = 10000;
    let bottom = 0;
    
    // Get page identifier from zones
    const pageId = getPageId(zones);
    
    // Download full sized page image
    const image = await Jimp.read(`https://trove.nla.gov.au/imageservice/nla.news-page${pageId}/level7`);
    // Resize the page image
    image.scale(scale);
    
    const boxes = [];
    // Loop through zones getting the bbox for each

    for (let zone of zones) {
        let zLeft = parseInt(zone.getAttribute("data-x"));
        let zTop = parseInt(zone.getAttribute("data-y"));
        let zWidth = parseInt(zone.getAttribute("data-w"));
        let zHeight = parseInt(zone.getAttribute("data-h"));
        let zBottom = zTop + zHeight;
        let zRight = zLeft + zWidth;
        
        // Compare current zone bbox to article bbox, adjusting boundaries to fit
        if (zTop < top) {
            top = zTop;
        }
        if (zLeft < left) {
            left = zLeft;
        }
        if (zRight > right) {
            right = zRight;
        }
        if (zBottom > bottom) {
            bottom = zBottom;
        }
        // Save the bbox for each zone
        let box = {x: zLeft * scale, y: zTop * scale, w: zWidth * scale, h: zHeight * scale};
        boxes.push(box)
    }
    // Crop the page image using the zone coordinates
    // console.log("crop image");
    let cropped = image.crop({
        x: left * scale,
        y: top * scale,
        w: (right - left) * scale,
        h: (bottom - top) * scale
    });
    // If mask is true, use the zone bboxes to copy all the sections of an article from the cropped page
    // and paste the sections into a new image.
    // This creates a new image with only content from the selected article.
    if (maskCheck.checked) {
        // console.log("new image");
        const newImage = new Jimp({
            width: cropped.width,
            height: cropped.height,
            color: 4294967295
        });
        for (let box of boxes) {
            let croppedBox = {x: Math.floor(box.x - (left * scale)), y: Math.floor(box.y - (top * scale)), w: Math.floor(box.w), h: Math.floor(box.h)};
            let crop = cropped.clone().crop(croppedBox);
            newImage.blit({src: crop, x: croppedBox.x, y: croppedBox.y});
        }
        await prepareArticleImage(newImage, pageId);
    } else {
        await prepareArticleImage(cropped, pageId);
    }
    progressPara.innerText = "";
}

// Initial setup
// Adds heading and buttons to the "Download" panel in the Trove interface

const downloadPanel = document.querySelector("form.renditions").parentElement;

let heading = document.createElement("h4");
heading.setAttribute("class", "content-heading");
heading.innerText = "Download image";
heading.style.fontFamily = '"Source Sans Variable", sans-serif';

let articleButton = document.createElement("a");
articleButton.setAttribute("class", "btn btn-primary btn-sm rendition-loader articleRendition");
articleButton.setAttribute("id", "article-image-button");
articleButton.addEventListener("click", await getArticleImage);
articleButton.innerText = "Article";

let pageButton = document.createElement("a");
pageButton.setAttribute("class", "btn btn-primary btn-sm rendition-loader articleRendition");
pageButton.setAttribute("id", "page-image-button");
pageButton.addEventListener("click", await getPageImage);
pageButton.innerText = "Page";


let scaleSelect = document.createElement("select");
for (let i = 1; i<=10; i++){
    let opt = document.createElement('option');
    opt.value = i;
    opt.text = "Scale: " + i / 10;
    scaleSelect.appendChild(opt);
}
scaleSelect.style.color = "#555555";
scaleSelect.style.marginLeft = "5px";
scaleSelect.style.padding = "2px";
scaleSelect.setAttribute("id", "article-scale-select");
scaleSelect.selectedIndex = 4;

let maskCheck = document.createElement("input");
maskCheck.setAttribute("type", "checkBox");
maskCheck.setAttribute("id", "article-mask-checkBox");
maskCheck.style.marginLeft = "5px";

let maskLabel = document.createElement("label");
maskLabel.setAttribute("for", "article-mask-checkBox");
maskLabel.innerText = "mask";
maskLabel.style.marginLeft = "3px";

let progressPara = document.createElement("p");
progressPara.setAttribute("id", "image-load-progress");
progressPara.style.marginTop = "5px";

let articleDiv = document.createElement("div");
let pageDiv = document.createElement("div");
pageDiv.style.marginTop = "5px";

downloadPanel.appendChild(heading);
articleDiv.appendChild(articleButton);
articleDiv.appendChild(scaleSelect);
articleDiv.appendChild(maskCheck);
articleDiv.appendChild(maskLabel);
downloadPanel.appendChild(articleDiv)
pageDiv.appendChild(pageButton);
downloadPanel.appendChild(pageDiv);

downloadPanel.appendChild(progressPara);

// To get around memory issues, manual edit the js file 
//maxMemoryUsageInMB:512