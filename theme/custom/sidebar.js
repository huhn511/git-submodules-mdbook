// Find Chapter Items
var chapterItems = document.querySelectorAll(".chapter-item")
console.log(chapterItems)

// Initially close all items
chapterItems.forEach(item => {
    // if (item.nextSibling && item.nextSibling.tagName === "LI" && item.nextSibling.classList === undefined) {
    if (item.nextSibling && !item.nextSibling.classList.contains('chapter-item')) {
        item.classList.add('collapsible')
        item.addEventListener('click', event => expandChapterItem(item))
    }
    if (item.parentElement && item.parentElement.classList.contains('chapter')) {
        item.classList.remove('collapsible')
    }
    if (item.parentElement && !item.parentElement.classList.contains('chapter')) {
        item.classList.remove('expanded')
    }
})

// Find the one active element which is the a tag inside a chapter-item
let mySidebar = document.getElementById('sidebar')
let activeLink = mySidebar.querySelector('.chapter-item a.active')

// Find parent ChapterItem and add class expanded
let activeChapterItem = activeLink.parentElement
activeChapterItem.classList.add('expanded')

// Find next parent chapter-item
const getParentChapterItem = (node) => {
    return node.parentElement.parentElement.previousSibling
}
let parentChapterItem = getParentChapterItem(activeChapterItem)

// console.log("ActiveLink", activeLink)

// Loop as long as parent node is a chapter item
// otherwise we are out of the sidebar nav and stop the loop
let looping = true
while(looping) {
    if (parentChapterItem.classList && parentChapterItem.classList.contains('chapter-item')) {
        parentChapterItem.classList.add('expanded')
        activeChapterItem = parentChapterItem
        parentChapterItem = getParentChapterItem(activeChapterItem)
    } else {
        // We are outside the sidebar nav
        looping = false
    }
}

// Callback for Chapter onClick
let expandChapterItem = (item) => {
    item.classList.add('expanded')
}
