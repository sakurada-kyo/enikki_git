from django.shortcuts import render

def view_calendar(request):
    
    return render(request,'calendar.html')

def view_usersearch(request):
    
    return render(request,'usersearch.html')
