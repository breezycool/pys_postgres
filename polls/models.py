"""
Name: models.py
Author: PYS team
Contents:
the models through which Django interacts with the database (in this
case, PostgreSQL) 
Info:
See documentation for structural diagram depicting connections between
models.
"""
from django.db import models
from django.utils import timezone

# ------------------ models for user ----------------------------

class User(models.Model):
    fb_id = models.CharField(max_length=100) #no idea what maxlength is
    gender = models.CharField(max_length=100, null=True)
    birthday = models.DateField(null=True) # takes a datetime.datetime instance
    lat = models.FloatField(null=True)
    lon = models.FloatField(null=True)
    # non-significant fields
    email = models.EmailField(max_length=100, null=True)
    name = models.CharField(max_length=100, null=True)
    def __unicode__(self):
        return self.name

class Question(models.Model):
    question_text = models.CharField(max_length=100, default="")
    creator = models.ForeignKey(User, null=True, related_name='question_created')
    pub_date = models.DateTimeField('date published', default=timezone.now()) # will have to expand this to time published
    flags = models.ManyToManyField(User, blank=True, related_name='question_flagged')
    lat = models.FloatField(null=True, blank=False)
    lon = models.FloatField(null=True, blank=False)
    def __unicode__(self):
        return self.question_text
    class Meta:
        ordering = ('question_text',)

class Answer(models.Model):
    question = models.ForeignKey(Question)
    text = models.CharField(max_length=100)
    users = models.ManyToManyField(User, blank=True)
    def __unicode__(self):
        return self.text
    class Meta:
        ordering = ('text',)

# makeshift class that details info between a User-Answer connection
# must ensure that there are never two AnswerInfos for a User-Answer connection
class AnswerInfo(models.Model):
    answer = models.ForeignKey(Answer)
    user = models.ForeignKey(User)
    lat = models.FloatField(null=True, blank=False)
    lon = models.FloatField(null=True, blank=False)
    time = models.DateTimeField('time answered', default=timezone.now())
    def __unicode__(self):
        return self.answer.text
