from django import template
from polls.models import Question
register = template.Library()

@register.filter
def move_right(q_id):
    allqs = Question.objects.all().order_by('-pub_date')[:50]
    for i in range(0, allqs.count()-1):
        if allqs[i].pk == q_id:
            return allqs[i+1].pk
    return allqs[0].pk

@register.filter
def move_left(q_id):
    allqs = Question.objects.all().order_by('-pub_date')
    maxi = allqs.count() - 1
    for i in range(1, maxi + 1):
        if allqs[i].pk == q_id:
            return allqs[i-1].pk
    return allqs[maxi].pk