from polls.models import *

user = User.objects.first()

for each in user.answer_set.all():
    each.users.remove(user)