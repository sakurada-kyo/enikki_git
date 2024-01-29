from django import forms

class UpLoadProfileImgForm(forms.Form):
    groupIcon = forms.ImageField(required=True)
    groupname = forms.CharField(required=True)

    def clean_groupIcon(self):
        group_icon = self.cleaned_data['groupIcon']
        if not group_icon:
            print('clean_groupIcon:失敗')
            raise forms.ValidationError('画像がアップロードされていません。')
        print('clean_groupIcon:成功')
        return group_icon

    def clean_groupname(self):
        print('clean_groupname')
        groupname = self.cleaned_data['groupname']
        if not groupname or groupname.strip() == '':
            print('グループ名が空白です。')
            raise forms.ValidationError('グループ名が空白です。')
        print('clean_groupname:成功')
        return groupname
    
