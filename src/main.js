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
async function displayDownload(imageData, imageType, imageId) {
    // Target to add download links
    let downloadPanel = document.querySelector("form.renditions").parentElement;
    
    // Create thumbnail image
    let imageElem = document.createElement("img");
    imageElem.setAttribute("src", imageData);
    imageElem.setAttribute("width", 200);
    
    // Create a download link
    let downLink = document.createElement("a");
    downLink.setAttribute("href", imageData);
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

// Add download links for full page image
async function fullPageImage () {
    const pageId = getPageId();
    const pageUrl = `https://trove.nla.gov.au/imageservice/nla.news-page${pageId}/level7`;
    await displayDownload(pageUrl, "page", pageId);
}

// Crop and mask article, add download links
async function croppedImage() {
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
    
    // Create a new image with the same dimensions
    const newImage = new Jimp({ width: image.width, height: image.height, color: 0xffffffff });
    
    // Loop through zones getting the bbox for each
    // Use the zone bboxes to extract all the sections of an article from a page image
    // Then assemble the sections in a new image
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
        
        // Crop out the section of the image that corresponds to the current zone
        let box = {x: zLeft, y: zTop, w: zWidth, h: zHeight};
        let crop = image.clone().crop(box);
        
        // Paste the cropped section into the new image
        newImage.composite(crop, box.x, box.y);
    }
    // Crop the new image using the article bbox
    let cropped = newImage.crop({x: left, y: top, w: right - left, h: bottom - top});
    
    // Get the article identifier from the url
    const articleId = document.location.href.match(/article\/(\d+)/)[1];
    
    // Convert the image to base 64
    const base64 = await cropped.getBase64("image/jpeg", {quality: 90});
    await displayDownload(base64, "article", `${articleId}-page${pageId}`);
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
articleButton.addEventListener("click", await croppedImage);
articleButton.innerText = "Article";

let pageButton = document.createElement("a");
pageButton.setAttribute("class", "btn btn-primary btn-sm rendition-loader articleRendition");
pageButton.setAttribute("id", "page-image-button");
pageButton.addEventListener("click", await fullPageImage);
pageButton.innerText = "Page";
pageButton.style.marginLeft = "5px";

let progressPara = document.createElement("p");
progressPara.setAttribute("id", "image-load-progress");
progressPara.style.marginTop = "5px";
downloadPanel.appendChild(heading);
downloadPanel.appendChild(articleButton);
downloadPanel.appendChild(pageButton);
downloadPanel.appendChild(progressPara);