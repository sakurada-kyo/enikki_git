from django import forms
# from .models import PostMaster

class CreateForm(forms.ModelForm):
    class Meta:
        # model = PostMaster
        fields = ('sketch_path','diary')