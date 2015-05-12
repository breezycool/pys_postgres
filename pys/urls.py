"""
Name: urls.py
Author: PYS team
Contents:
the primary site view, and the view for the admin site.
"""
from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
	url(r'^', include('polls.urls', namespace="polls")),
	url(r'^admin/', include(admin.site.urls)),
)
