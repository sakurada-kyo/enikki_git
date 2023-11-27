$(document).ready(function () {
    function email_check(tgt) {
        var val = tgt.val();
        if (val) {
            var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(val)) {
                tgt.closest('.input-cont').removeClass('ok');
                tgt.closest('.input-cont').children('.err').text('メールアドレスが正しくありません。').css('display', 'block');
            } else {
                tgt.closest('.input-cont').addClass('ok');
                tgt.closest('.input-cont').children('.err').text('').css('display', 'none');
            }
        } else {
            var name = tgt.attr('name');
            tgt.closest('.input-cont').removeClass('ok');
            tgt.closest('.input-cont').children('.err').text(name + 'を入力してください。').css('display', 'block');
        }
    }
    // email_check を実行
    $('input[type=email]').on('change blur', function () {
        email_check($(this));
    });
});

$(document).ready(function () {
    function kana_check(tgt) {
        var val = tgt.val();

        if (val) {
            var kanaRegex = /^[ァ-ヶー]+$/;
            if (!kanaRegex.test(val)) {
                tgt.closest('.input-cont').removeClass('ok');
                tgt.closest('.input-cont').children('.err').text('全角カタカナで入力してください。').css('display', 'block');
            } else {
                tgt.closest('.input-cont').addClass('ok');
                tgt.closest('.input-cont').children('.err').text('').css('display', 'none');
            }
        } else {
            var name = tgt.attr('name');
            tgt.closest('.input-cont').removeClass('ok');
            tgt.closest('.input-cont').children('.err').text(name + 'を入力してください。').css('display', 'block');
        }
    }
    // kana_check を実行
    $('input[name=フリガナ]').on('change blur', function () {
        kana_check($(this));
    });
});

$(document).ready(function () {
    function id_check(tgt) {
        var val = tgt.val();
        if (val) {
            var idRegex = /^[A-Za-z0-9!@#$%^&*()_+.,:;<>?{}\[\]|]+$/;
            if (!idRegex.test(val)) {
                tgt.closest('.input-cont').removeClass('ok');
                tgt.closest('.input-cont').children('.err').text('半角英数字と記号のみを入力してください。').css('display', 'block');
            } else {
                tgt.closest('.input-cont').addClass('ok');
                tgt.closest('.input-cont').children('.err').text('').css('display', 'none');
            }
        } else {
            var name = tgt.attr('name');
            tgt.closest('.input-cont').removeClass('ok');
            tgt.closest('.input-cont').children('.err').text(name + 'を入力してください。').css('display', 'block');
        }
    }
    // id_check を実行
    $('input[name=id]').on('change blur', function () {
        id_check($(this));
    });
});

$(document).ready(function () {
    function pass_check(tgt) {
        var val = tgt.val();
        if (val) {
            // var passRegex = <span class="hljs-regexp">/^[A-Za-z0-9!@#$%^&*()_+.,:;<>?{}\[\]|]{12,20}$/</span>;
            if (!passRegex.test(val)) {
                tgt.closest('.input-cont').removeClass('ok');
                tgt.closest('.input-cont').children('.err').text('パスワードが正しくありません。').css('display', 'block');
            } else {
                tgt.closest('.input-cont').addClass('ok');
                tgt.closest('.input-cont').children('.err').text('').css('display', 'none');
            }
        } else {
            var name = tgt.attr('name');
            tgt.closest('.input-cont').removeClass('ok');
            tgt.closest('.input-cont').children('.err').text(name + 'を入力してください。').css('display', 'block');
        }
    }
    // pass_check を実行
    $('input[name=pass0]').on('change blur', function () {
        pass_check($(this));
    });
});

