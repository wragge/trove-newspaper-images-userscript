# trove-newspaper-images-userscript

Ever wanted an easy way to save a newspaper article in Trove as a high-resolution image? This repository provides a userscript that adds new download options to Trove's newspaper interface – making it easy to save images of articles and pages.

When this userscript runs, it adds a new 'Download image' section to the 'Download' panel in Trove's newspaper interface. This section includes two buttons, 'Article' and 'Page'.

![Screenshot of Trove newspaper interface showing the new section added to the Download panel and the two new buttons](https://updates.timsherratt.org/uploads/2026/trove-newspapers-userscript-buttons.png)

If you click on the 'Article' button, the userscript generates a cropped and masked version of the article, extracted from the high-resolution page image. When it's ready, a thumbnail version of the cropped article is displayed in the panel – just click on the thumbnail to download the article image as a JPEG file.

![Screenshot of Trove newspaper interface showing the thumbnail of an article image displayed in the Download panel](https://updates.timsherratt.org/uploads/2026/trove-newspapers-userscript-article.png)

If you click on the 'Page' button, the userscript displays a thumbnail version of the high-resolution page image in the panel – just click on the thumbnail to download the full page image as a JPEG file.

![Screenshot of Trove newspaper interface showing the thumbnail of a page image displayed in the Download panel](https://updates.timsherratt.org/uploads/2026/trove-newspapers-page.png)

## Installation

To run this userscript, you first need to add a userscript manager to your browser. Userscript managers such as [Tampermonkey](https://www.tampermonkey.net/) are available as extensions for most browsers. (Note that if you install Tampermonkey in Chrome, you also have [to explictly allow it to run userscripts](https://www.tampermonkey.net/faq.php?q=Q209) in the extension settings.)

Once you've installed a userscript manager, you can add this userscript. I've included two versions:

- [minified](https://github.com/wragge/trove-newspaper-images-userscript/blob/main/dist/trove-newspaper-images.min.user.js) (smaller file size, hard to read)
- [un-minified](https://github.com/wragge/trove-newspaper-images-userscript/blob/main/dist/trove-newspaper-images.user.js) (larger file size, best if you want to read or edit the code)

Click on one of the links above to open the userscript page in GitHub. Then click on the 'Raw' button at the top-right of the file viewer. Your userscript manager will intercept this link and ask you if you want to install the userscript. Click on the 'Install' button and you're done!

## Notes and acknowledgements

This userscript uses the [Jimp](https://github.com/jimp-dev/jimp) library to manipulate the images. Jimp is copyright (c) 2018 Oliver Moran, and is provided under a MIT license.

I used [Vite](https://vite.dev) to develop and package this userscript.

## More userscripts!

For more on GLAM userscripts see:

- [GLAM hacking with userscripts](https://updates.timsherratt.org/2025/07/17/glam-hacking-with-userscripts.html)
- [Experiments with the State Library of Victoria’s collections](https://slv.wraggelabs.com)
- [How to 'hack' a library website – a video tutorial by Tim Sherratt](https://lab.slv.vic.gov.au/resources/hack-website-video-tim-sherratt) (SLV LAB)

----

Created by [Tim Sherratt](https://timsherratt.au), 2026