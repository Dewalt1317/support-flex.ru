let buttonDonat = document.querySelector(".buttonDonat")
let getTimeInterval = setInterval(() => {}, 0)

buttonDonat.addEventListener("click", ()=>{
    window.open('https://www.donationalerts.com/r/support_flex_station', '_blank');
})

get ()
getTimeInterval = setInterval(get, 5000)

function get () {
    dataSend = {"chat": dataChatSend, "title": dataTitleSend}
    SendRequest("POST", "php/get.php", dataSend, (data) => {
        data = JSON.parse(data)
        getTitle(data["title"])
        getChat(data["chat"])
    })
}

document.addEventListener('click', function(event) {
    const menuContainers = document.querySelectorAll('.menu-container');
    for (let i = 0; i < menuContainers.length; i++) {
        const menuContainer = menuContainers[i];
        const menuList = menuContainer.querySelector('.menuList');

        if (!menuContainer.contains(event.target)) {
            menuContainer.classList.remove('clicked');
            menuList.style.opacity = 0;
            setTimeout(function() {
                menuList.style.display = 'none';
            }, 300);
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const menuButtons = document.querySelectorAll('.menu-button');
    for (let i = 0; i < menuButtons.length; i++) {
        const menuButton = menuButtons[i];
        const menuContainer = menuButton.parentNode;
        const menuList = menuContainer.querySelector('.menuList');

        menuButton.addEventListener('click', function() {
            menuContainer.classList.toggle('clicked');
            if (menuContainer.classList.contains('clicked')) {
                menuList.style.display = 'block';
                setTimeout(function() {
                    menuList.style.opacity = 1;
                }, 10);
            } else {
                menuList.style.opacity = 0;
                setTimeout(function() {
                    menuList.style.display = 'none';
                }, 300);
            }
        });
    }
});

document.addEventListener('keydown', function (event) {
    if (event.target.hasAttribute("data-input")){
        switch (event.code){
            case "Enter":
                if (!event.shiftKey){
                    event.preventDefault()
                    send()
                }
                if (inputMessage.textContent !== "") inputMessage.textContent = null
                break
        }
    } else {
        switch (event.code){
            case "Space":
                buttonPlayPause()
                break

            case "KeyM":
                volume()
                break

            case "ArrowUp":
                volume("up")
                break
            case "ArrowDown":
                volume("down")
                break
        }
    }
})