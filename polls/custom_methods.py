from polls.models import *
from datetime import *
from geopy.distance import vincenty

# calculate age from a datetime object, born, specifying when user was born
def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

"""
format answers in the following format:
--WRITE FORMAT HERE--
"""
def formatAnswers(answer_set):
    array = []
    for a in answer_set:
        obj = {}
        obj['answer'] = a.text
        obj['frequency'] = a.users.count()
        # find formatted data ---
        maleCount = 0
        femaleCount = 0
        ageArray = [0,0,0,0,0,0,0]
        for user in a.users.all():
            if user.gender == 'male':
                maleCount += 1
            if user.gender == 'female':
                femaleCount += 1
            age = calculate_age(user.birthday)
            # ['Under 14'], ['15-17'], ['18-21'], ['22-29'], ['30-39'], ['40-49'], ['Over 50'])
            if age <= 14:
                ind = 0
            elif age <= 17:
                ind = 1
            elif age <= 21:
                ind = 2
            elif age <= 29:
                ind = 3
            elif age <= 39:
                ind = 4
            elif age <= 49:
                ind = 5
            else:
                ind = 6
            ageArray[ind] += 1
        # -----------------------
        obj['maleFrequency'] = maleCount
        obj['femaleFrequency'] = femaleCount
        obj['ageFreqs'] = ageArray
        array.append(obj)
    return array

"""
sort array of questions, first by method specified in sub_query, 
then by the complimentary method ('popular' or 'recent'). rec_dir
specifies the direction of the recent sorting, and pop_dir specifies
the direction of the popular sorting ('asc' or 'desc')
"""
# ---------------------------------------------------------------------
# sort array of questions by most popular
def sortByPopular(array): #IS THIS GOING TO BE SLOW?????
    # popular is most answered
    def mostPopular(x):
        # count answers associated with each answer
        question = Question.objects.get(pk=int(x['qID']))
        xcount = 0
        for answer in question.answer_set.all():
            xcount += answer.users.count()
        return xcount

    return sorted(array, key=mostPopular)

# sort array of questions by most recent
def sortByRecent(array):
    # recent is most recent time
    def mostRecent(x):
        return Question.objects.get(pk=int(x['qID'])).pub_date

    return sorted(array, key=mostRecent)

# holistic sort function
def sortBy(array, primary, rec_dir, pop_dir):
    if primary == 'popular':
        data = sortByRecent(array)
        if rec_dir == 'desc':
            data = list(reversed(data))
        data = sortByPopular(data)
        if pop_dir == 'desc':
            data = list(reversed(data))
        return data
    else:
        data = sortByPopular(array)
        if pop_dir == 'desc':
            data = list(reversed(data))
        data = sortByRecent(data)
        if rec_dir == 'desc':
            data = list(reversed(data))
        return data
# ---------------------------------------------------------------------

# function used in ajax views to return the next 50 questions relevant
# to user
def getQuestions(user_pk, ran):
    questions = []
    returncount = 2
    try:
        user = User.objects.get(pk=user_pk)
    except:
        return questions

    lat = user.lat
    lon = user.lon
    radius = 5 
    qs = Question.objects.order_by('-pub_date') # newest first

    if ran == "near":
        for q in qs:
            # exclude all questions outside five km radius
            # vincenty is an external method from geo.py
            if vincenty((lon,lat),(q.lon,q.lat)).miles > radius:
                qs = qs.exclude(pk=q.pk)
    elif ran == "far":
        for q in qs:
            # exclude all questions inside five mile radius
            if vincenty((lon,lat),(q.lon,q.lat)).miles < radius:
                qs = qs.exclude(pk=q.pk)
    # exclude already answered (or flagged) questions
    for each in user.answer_set.all():
        qs = qs.exclude(pk=each.question.pk) 
    for q in user.question_flagged.all():
        qs = qs.exclude(pk=q.pk)

    count = 0
    for q in qs:
        # add questions that user has not already answered
        usercount = 0
        for answer in q.answer_set.all():
            usercount += answer.users.count()

        # question must have at least five flags
        # if more than 1/7th of users have flagged, don't show to anyone
        if (q.flags.count() >= 5) and (q.flags.count() >= usercount/7):
            pass
        else:
            questions.append(q)
            count+=1
        # specifies number of unanswered questions to return
        if count >= returncount:
            break
    return questions