from django.conf.urls import patterns, url
from polls import views
from django.contrib.auth.views import login, logout

urlpatterns = patterns('',
    # ----------------- page views ---------------------
    url(r'^index/$|^$', views.index, name='index'),
    url(r'^answered/$', views.answeredqs, name='answered'),
    url(r'^f/$', views.f, name='f'),
    # ------------------ ajax views ------------------------
    url(r'^getq/$', views.get_questions, name='get_questions'),
    url(r'^flagq/$', views.flag_question, name='flag_question'),
    url(r'^getdata/$', views.get_data, name='get_data'),
    url(r'^getprofile/$', views.get_profile, name='get_profile'),
    url(r'^saveu/$', views.save_user, name='save_user'),
    url(r'^saveq/$', views.save_question, name='save_question'),
    url(r'^savea/$', views.save_answers, name='save_answers'),
    # ------------------- test views -----------------------
    url(r'^test/createuser$', views.create_user, name='createuser'),
    # ----------------- non-ajax views ---------------------
    url(r'^submitq/$', views.submitq, name='submitq'),
    url(r'^(?P<question_id>\d+)/', views.detail, name='detail'),
    url(r'^answered/(?P<question_id>\d+)/(?P<answer_id>.+)/', views.answered, name='answered'),
)