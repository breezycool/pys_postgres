from polls.models import *

user = User.objects.first()

for each in user.answer_set.all():
    AnswerInfo.objects.get(user=user,answer=each).delete()
    each.users.remove(user)