from django import forms
from .models import GroupMaster

class UploadForm(forms.ModelForm):
    class Meta:
        model = GroupMaster
        fields = ['image']