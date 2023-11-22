let emojiValue = ""
let inputMessage = document.querySelector(".inputMessage")
let emojiTd = document.querySelectorAll('td')
emojiTd.forEach(function(item)
{
    item.onclick = function()
    {
        emojiValue  = this.textContent
        inputMessage.value = inputMessage.value + emojiValue
    }
})