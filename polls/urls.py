"""
Name: urls.py
Author: PYS team
Contents:
URLs that map onto the site's views, including AJAX requests. 
Info:
The site is hosted from a single page view, static_index.html. This
view contains Javascript code that uses asychronous AJAX requests to 
communicate with the backend as the user interacts with the the site.

These AJAX views send and receive data as JSON strings. Each AJAX method
is documented in a function comment before the function itself.
"""

from django.conf.urls import patterns, url
from polls import views

urlpatterns = patterns('',
    # ----------------- page views ---------------------
    url(r'^index/$|^$', views.index, name='index'),
    # ------------------ ajax views ------------------------
    url(r'^getq/$', views.get_questions, name='get_questions'),
    url(r'^flagq/$', views.flag_question, name='flag_question'),
    url(r'^getdata/$', views.get_data, name='get_data'),
    url(r'^getprofile/$', views.get_profile, name='get_profile'),
    url(r'^saveu/$', views.save_user, name='save_user'),
    url(r'^saveq/$', views.save_question, name='save_question'),
    url(r'^savea/$', views.save_answers, name='save_answers'),
    # ------------------- test views -----------------------
)