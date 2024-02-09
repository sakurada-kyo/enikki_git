$(function () {
    $("#logout").on('click',() => {
        window.location.href = "/login_app/signout";
    })

    $(".logo").on("click",() => {
        window.location.href = "/enikki/timeline";
    })
})