from django.shortcuts import render

# Create your views here.

def index(request):
    context = {'clase':'index'}
    return render(request, 'discos/index.html', context)
