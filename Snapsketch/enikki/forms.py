from django import forms

class UpLoadProfileImgForm(forms.Form):
    avator = forms.ImageField(required=True)
    groupname = forms.CharField(required=True)

    def clean_avator(self):
        avator = self.cleaned_data['avator']
        if not avator:
            raise forms.ValidationError('画像がアップロードされていません。')
        return avator

    def clean_groupname(self):
        groupname = self.cleaned_data['groupname']
        if not groupname or groupname.strip() == '':
            raise forms.ValidationError('グループ名が空白です。')
        return groupname
