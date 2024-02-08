// eye-iconのclickクリックイベント
$("#eye-icon").on("click", () => {
    // eye-iconのclass切り替え
    $("#eye-icon").toggleClass("fa-eye-slash fa-eye");

    // inputのtype切り替え
    if ($("#id_password").attr("type") == "password") {
        $("#id_password").attr("type", "text");
    } else {
        $("#id_password").attr("type", "password");
    }
})

