$(".openbtn4").click(function () {
    $(this).toggleClass('active');
    var hamburgerMenu = document.querySelector('.hamburger-menu');
    hamburgerMenu.style.display = (hamburgerMenu.style.display === 'none' || hamburgerMenu.style.display === '') ? 'block' : 'none';
})