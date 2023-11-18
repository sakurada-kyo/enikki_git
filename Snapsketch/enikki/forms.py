from django import forms
from .models import SketchMaster

class CanvasForm(forms.ModelForm):
    class Meta:
        models = SketchMaster
        fields = '__all__'
        
class CreateForm(forms.ModelForm):
    class Meta:
        # model = PostMaster
        fields = ('diary','')
