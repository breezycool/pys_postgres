"""
Name: admin.py
Author: PYS team
Contents:
specifications for the Django admin site.
Info:
accessed at www.polledyouso.com/admin. Users may be added from within
the admin site by an existing user.
"""

from django.contrib import admin

# Register your models here.
from polls.models import *

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1

class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['question_text']}),
        ('Date Information', {'fields': ['pub_date'], 'classes': ['collapse']}),
        ('Location Information', {'fields': ['lat','lon'], 'classes': ['collapse']}),
    ]
    inlines = [AnswerInline]
    list_filter = ['pub_date'] # filter by location
    search_fields = ['question_text']

admin.site.register(Question, QuestionAdmin)
admin.site.register(User)
admin.site.register(AnswerInfo)
