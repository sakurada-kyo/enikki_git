from django import forms

class UpLoadProfileImgForm(forms.Form):
    avator = forms.ImageField(required=True)
    groupname = forms.CharField(required=True)

    def clean_avator(self):
        print('clean_avator')
        avator = self.cleaned_data['avator']
        if not avator:
            print('clean_avator:失敗')
            raise forms.ValidationError('画像がアップロードされていません。')
        print('clean_avator:成功')
        return avator

    def clean_groupname(self):
        print('clean_groupname')
        groupname = self.cleaned_data['groupname']
        if not groupname or groupname.strip() == '':
            print('グループ名が空白です。')
            raise forms.ValidationError('グループ名が空白です。')
        print('clean_groupname:成功')
        return groupname
    
class RequestForm(forms.ModelForm):
    class Meta:
        model = 
        fields = ['name','email','message']