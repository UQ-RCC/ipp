# Cards / Card Grid #

## Overview ##
Cards allow you to feature content in grids to create engaging pages that link through to sub-content. There are two (2) display modes: Stacked (default), and Overlay, giving flexibility for maximising the visual effect of your content.

Cards can be created as 'Custom cards', allowing you to specify the content to display for the card in that particular instance.  
Or, as a 'node reference' to an existing page. This will use the fields from that node to display in the card automatically if that node has the required fields (image, summary).

**Stacked**  
Card fields are stacked vertically: image, title, summary, action links.  
Best when summary text is required to convey a message.

**Overlay**  
Card fields are overlaid on the image.  
Best when text is not required and the image & title provide enough context.

###Type:###
Panels pane component

###View modes:###

* 2 column
* 3 column (Default)
* 4 column
* Overlay 2 column
* Overlay 3 column
* Overlay 4 column

###Fields (custom card):###

* **Title**
* **Image**
* **Content** - Optional. Short summary text to provide context to the link.
* **Primary link** - Optional. Link that applies to the image and title. For overlay cards it links the whole card.
* **Action links** - Optional. Allows additional links to display at the bottom of the card, separate to the primary link. Used for specific actions like registering or downloading a document.

[Sample markup](card.html)

## When to use Cards ##
On landing pages, when displaying a group of 2-8 related links to sub-content. 

## When you should avoid using Cards ##
* When there are more than 8 links in a single group.  
* If images are not available or required.
* If a long summary text is required to explain the content.
* If links require categorising.
