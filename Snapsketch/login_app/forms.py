# forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    gender = forms.ChoiceField(choices=GENDER_CHOICES, widget=forms.RadioSelect)
    birthday = forms.DateField(
        widget=forms.SelectDateWidget(years=range(1920, 2101), attrs={'class': 'form-select'})
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'ユーザー名'
        self.fields['email'].label = 'メールアドレス'
        self.fields['password1'].label = 'パスワード'
        self.fields['password2'].label = 'パスワード確認'
        self.fields['user_icon_path'].label = 'アイコン画像'
        self.fields['tel'].label = '電話番号'
        self.fields['tel'].widget.attrs['placeholder'] = '00011112222'
        self.fields['gender'].label = '性別'
        self.fields['gender'].choices = [
            ('M', '男性'),
            ('F', '女性'),
            ('O', 'その他'),
        ]
        self.fields['birthday'].label = '誕生日'
        

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2', 'user_icon_path', 'tel', 'gender', 'birthday')
